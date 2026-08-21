-- Phase 4: Delta-Sync Engine Architecture

-- 1. Create Monotonic Sequence
CREATE SEQUENCE IF NOT EXISTS public.svaro_sync_seq;
GRANT USAGE ON SEQUENCE public.svaro_sync_seq TO authenticated;

-- 2. Add Sync Columns to User Tables
DO $$ 
DECLARE
    tbl text;
    user_owned_tables text[] := ARRAY[
        'profiles', 'goals', 'nutrition_targets', 'workout_templates', 
        'challenge_templates', 'task_templates', 'supplement_templates',
        'workout_sessions', 'set_logs', 'food_logs', 'weight_logs', 
        'measurement_logs', 'progress_photos', 'water_logs', 'step_logs', 
        'sleep_logs', 'daily_tasks', 'habit_logs', 'skincare_products', 
        'skincare_routines', 'skincare_logs', 'cloud_backups',
        'habits', 'recommendations'
    ];
BEGIN
    FOR tbl IN SELECT unnest(user_owned_tables) LOOP
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 1;', tbl);
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS change_sequence BIGINT DEFAULT 0;', tbl);
        END IF;
    END LOOP;
END $$;

-- 3. Idempotency Table
CREATE TABLE IF NOT EXISTS public.processed_mutations (
    mutation_id uuid PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now()
);
ALTER TABLE public.processed_mutations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can insert own mutations" ON public.processed_mutations;
DROP POLICY IF EXISTS "Users can read own mutations" ON public.processed_mutations;
CREATE POLICY "Users can insert own mutations" ON public.processed_mutations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own mutations" ON public.processed_mutations FOR SELECT USING (auth.uid() = user_id);

-- 4. Revocation Log
CREATE TABLE IF NOT EXISTS public.revocation_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    target_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_type text NOT NULL,
    resource_id uuid NOT NULL,
    change_sequence bigint NOT NULL,
    revoked_at timestamptz DEFAULT now()
);
ALTER TABLE public.revocation_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Targets can read own revocations" ON public.revocation_log;
CREATE POLICY "Targets can read own revocations" ON public.revocation_log FOR SELECT USING (auth.uid() = target_user_id);

CREATE OR REPLACE FUNCTION public.log_share_revocation() RETURNS trigger AS $TRG$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO public.revocation_log (target_user_id, resource_type, resource_id, change_sequence)
        VALUES (OLD.target_user_id, OLD.resource_type, OLD.resource_id, nextval('public.svaro_sync_seq'));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' AND NEW.revoked_at IS NOT NULL AND OLD.revoked_at IS NULL THEN
        INSERT INTO public.revocation_log (target_user_id, resource_type, resource_id, change_sequence)
        VALUES (NEW.target_user_id, NEW.resource_type, NEW.resource_id, nextval('public.svaro_sync_seq'));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$TRG$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_share_revocation ON public.resource_shares;
CREATE TRIGGER trg_share_revocation
AFTER UPDATE OR DELETE ON public.resource_shares
FOR EACH ROW EXECUTE FUNCTION public.log_share_revocation();

-- 5. Sync Push RPC
CREATE OR REPLACE FUNCTION public.sync_push(payload jsonb)
RETURNS jsonb AS $FUNC$
DECLARE
    item jsonb;
    mut_id uuid;
    tbl text;
    rec_id uuid;
    op text;
    rec_data jsonb;
    inc_version bigint;
    existing_version bigint;
    seq bigint;
    result jsonb := '[]'::jsonb;
    set_clause text;
    upsert_sql text;
BEGIN
    FOR item IN SELECT * FROM jsonb_array_elements(payload) LOOP
        mut_id := (item->>'mutation_id')::uuid;
        tbl := item->>'entity_type';
        rec_id := (item->>'entity_id')::uuid;
        op := item->>'operation';
        rec_data := item->'payload';
        inc_version := COALESCE((rec_data->>'version')::bigint, 1);
        
        -- 1. Idempotency Check
        IF EXISTS (SELECT 1 FROM public.processed_mutations WHERE mutation_id = mut_id) THEN
            result := result || jsonb_build_object('mutation_id', mut_id, 'status', 'SUCCESS', 'note', 'duplicate');
            CONTINUE;
        END IF;

        BEGIN
            -- 2. Fetch existing version dynamically
            EXECUTE format('SELECT version FROM public.%I WHERE id = $1', tbl) INTO existing_version USING rec_id;

            -- 3. Version Check / Conflict Resolution
            IF existing_version IS NOT NULL THEN
                IF inc_version < existing_version THEN
                    result := result || jsonb_build_object('mutation_id', mut_id, 'status', 'CONFLICT', 'server_version', existing_version);
                    CONTINUE;
                END IF;
                -- Match or greater (valid update)
                rec_data := rec_data || jsonb_build_object('version', existing_version + 1);
            ELSE
                -- New record
                rec_data := rec_data || jsonb_build_object('version', 1);
            END IF;

            seq := nextval('public.svaro_sync_seq');
            rec_data := rec_data || jsonb_build_object('change_sequence', seq);

            -- 4. Dynamic Upsert
            SELECT string_agg(column_name || ' = EXCLUDED.' || column_name, ', ')
            INTO set_clause
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = tbl AND column_name != 'id';

            upsert_sql := format('
                INSERT INTO public.%I SELECT * FROM jsonb_populate_record(null::public.%I, $1)
                ON CONFLICT (id) DO UPDATE SET %s
            ', tbl, tbl, set_clause);
            
            EXECUTE upsert_sql USING rec_data;

            -- 5. Mark as processed
            INSERT INTO public.processed_mutations (mutation_id, user_id) VALUES (mut_id, auth.uid());

            result := result || jsonb_build_object('mutation_id', mut_id, 'status', 'SUCCESS', 'version', COALESCE(existing_version + 1, 1), 'change_sequence', seq);

        EXCEPTION WHEN OTHERS THEN
            -- Catch constraints/RLS errors
            result := result || jsonb_build_object('mutation_id', mut_id, 'status', 'ERROR', 'error', SQLERRM);
        END;
    END LOOP;

    RETURN result;
END;
$FUNC$ LANGUAGE plpgsql;
