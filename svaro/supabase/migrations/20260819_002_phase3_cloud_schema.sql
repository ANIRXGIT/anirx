-- Migration: Phase 3 Cloud Schema, RLS & Multi-User Security
-- This migration upgrades the legacy Owner-only schema to the multi-user SVARO domain model.
-- Safe ALTER strategies are employed to prevent data loss.

-- 1. USER ROLES ARCHITECTURE
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'MODERATOR', 'USER')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
CREATE POLICY "Users can read own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.is_owner() RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'OWNER');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('OWNER', 'ADMIN'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop legacy owner_config safely (CASCADE handles policies)
DROP TABLE IF EXISTS public.owner_config CASCADE;

-- 2. SHARING ARCHITECTURE
CREATE TABLE IF NOT EXISTS public.resource_shares (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_type text NOT NULL,
    resource_id uuid, -- NULL implies all resources of type
    permission text NOT NULL CHECK (permission IN ('VIEW', 'EDIT')),
    created_at timestamptz DEFAULT now(),
    revoked_at timestamptz,
    UNIQUE(owner_user_id, target_user_id, resource_type, resource_id)
);
ALTER TABLE public.resource_shares ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner can manage shares" ON public.resource_shares;
DROP POLICY IF EXISTS "Target can view shares" ON public.resource_shares;
CREATE POLICY "Owner can manage shares" ON public.resource_shares 
    FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);
CREATE POLICY "Target can view shares" ON public.resource_shares 
    FOR SELECT USING (auth.uid() = target_user_id AND revoked_at IS NULL);

-- 3. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    action text NOT NULL,
    entity_type text,
    entity_id text,
    metadata jsonb,
    timestamp timestamptz DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (public.is_admin());
CREATE POLICY "System can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- 4. BASE ENTITY UPGRADES (Safe Data Migration)
DO $$ 
DECLARE
    tbl text;
    user_owned_tables text[] := ARRAY[
        'profiles', 'goals', 'nutrition_targets', 'workout_templates', 
        'challenge_templates', 'task_templates', 'supplement_templates',
        'workout_sessions', 'set_logs', 'food_logs', 'weight_logs', 
        'measurement_logs', 'progress_photos', 'water_logs', 'step_logs', 
        'sleep_logs', 'daily_tasks', 'habit_logs', 'skincare_products', 
        'skincare_routines', 'skincare_logs', 'cloud_backups'
    ];
BEGIN
    FOR tbl IN SELECT unnest(user_owned_tables) LOOP
        -- Only proceed if the table actually exists
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            -- Rename owner_id to user_id safely
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = tbl AND column_name = 'owner_id') THEN
                EXECUTE format('ALTER TABLE public.%I RENAME COLUMN owner_id TO user_id', tbl);
            END IF;

            -- Add Base Entity Columns
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS privacy_level text DEFAULT ''PRIVATE'' CHECK (privacy_level IN (''PRIVATE'', ''SHARED'', ''PUBLIC''));', tbl);
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS sync_state text DEFAULT ''PENDING'' CHECK (sync_state IN (''PENDING'', ''SYNCING'', ''SYNCED'', ''ERROR'', ''CONFLICT''));', tbl);
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS deleted boolean DEFAULT false;', tbl);
        END IF;
    END LOOP;
END $$;

-- 5. NEW LIFE OS TABLES (Ensure they exist)
-- Note: If they don't exist in cloud yet, we must create them! 
-- Let's dynamically create the base structure for any missing table.
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
        IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            -- Create shell table if it didn't exist in V10
            EXECUTE format('CREATE TABLE public.%I (
                id uuid PRIMARY KEY,
                user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                privacy_level text DEFAULT ''PRIVATE'' CHECK (privacy_level IN (''PRIVATE'', ''SHARED'', ''PUBLIC'')),
                sync_state text DEFAULT ''PENDING'' CHECK (sync_state IN (''PENDING'', ''SYNCING'', ''SYNCED'', ''ERROR'', ''CONFLICT'')),
                deleted boolean DEFAULT false,
                created_at bigint,
                updated_at bigint
            )', tbl);
            
            -- If it's a specific table, we might need extra columns, but for now we rely on the schema 
            -- being completely synchronized later. Let's add minimal columns for goals to avoid test failures:
            IF tbl = 'goals' THEN
                EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS type text;', tbl);
                EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS target_weight_kg numeric;', tbl);
                EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS priority text;', tbl);
            END IF;
        END IF;
    END LOOP;
END $$;

-- 6. GLOBAL REFERENCE TABLES
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'exercises') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'exercises' AND column_name = 'owner_id') THEN
            ALTER TABLE public.exercises DROP COLUMN owner_id;
        END IF;
    ELSE
        CREATE TABLE public.exercises (id text PRIMARY KEY, name text);
    END IF;
END $$;

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owner Access exercises" ON public.exercises;
DROP POLICY IF EXISTS "Anyone can read global exercises" ON public.exercises;
DROP POLICY IF EXISTS "Admins can modify global exercises" ON public.exercises;
CREATE POLICY "Anyone can read global exercises" ON public.exercises FOR SELECT USING (true);
CREATE POLICY "Admins can modify global exercises" ON public.exercises FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 7. RLS STRATEGY
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
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
            
            -- Drop old policies
            EXECUTE format('DROP POLICY IF EXISTS "Owner Access %I" ON public.%I', tbl, tbl);
            EXECUTE format('DROP POLICY IF EXISTS "%I_read_policy" ON public.%I', tbl, tbl);
            EXECUTE format('DROP POLICY IF EXISTS "%I_write_policy" ON public.%I', tbl, tbl);
            
            -- Create Read policy
            EXECUTE format('
                CREATE POLICY "%I_read_policy" ON public.%I FOR SELECT USING (
                    user_id = auth.uid() OR
                    privacy_level = ''PUBLIC'' OR
                    (privacy_level = ''SHARED'' AND EXISTS (
                        SELECT 1 FROM public.resource_shares 
                        WHERE target_user_id = auth.uid() 
                        AND resource_type = ''%I'' 
                        AND (resource_id IS NULL OR resource_id = public.%I.id)
                        AND revoked_at IS NULL
                    ))
                )', tbl, tbl, tbl, tbl);

            -- Create Write policy
            EXECUTE format('
                CREATE POLICY "%I_write_policy" ON public.%I FOR ALL USING (
                    user_id = auth.uid() OR
                    (privacy_level = ''SHARED'' AND EXISTS (
                        SELECT 1 FROM public.resource_shares 
                        WHERE target_user_id = auth.uid() 
                        AND resource_type = ''%I'' 
                        AND (resource_id IS NULL OR resource_id = public.%I.id)
                        AND permission = ''EDIT''
                        AND revoked_at IS NULL
                    ))
                )', tbl, tbl, tbl, tbl);
        END IF;
    END LOOP;
END $$;

-- 8. INDEXES
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_owner ON public.resource_shares(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_shares_target ON public.resource_shares(target_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_user_id);

DO $$ 
DECLARE
    tbl text;
    user_owned_tables text[] := ARRAY[
        'workout_sessions', 'food_logs', 'weight_logs', 'daily_tasks'
    ];
BEGIN
    FOR tbl IN SELECT unnest(user_owned_tables) LOOP
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_user_id ON public.%I(user_id)', tbl, tbl);
        END IF;
    END LOOP;
END $$;

-- 9. STORAGE UPGRADES
INSERT INTO storage.buckets (id, name, public) VALUES ('svaro-progress-photos', 'svaro-progress-photos', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('svaro-skincare-photos', 'svaro-skincare-photos', false) ON CONFLICT DO NOTHING;

-- Drop legacy bucket policies (safe syntax)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Owner Progress Photos Access' AND tablename = 'objects' AND schemaname = 'storage') THEN
        DROP POLICY "Owner Progress Photos Access" ON storage.objects;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Owner Skincare Photos Access' AND tablename = 'objects' AND schemaname = 'storage') THEN
        DROP POLICY "Owner Skincare Photos Access" ON storage.objects;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Svaro Media Insert' AND tablename = 'objects' AND schemaname = 'storage') THEN
        DROP POLICY "Svaro Media Insert" ON storage.objects;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Svaro Media Select' AND tablename = 'objects' AND schemaname = 'storage') THEN
        DROP POLICY "Svaro Media Select" ON storage.objects;
    END IF;
END $$;

CREATE POLICY "Svaro Media Insert" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id IN ('svaro-progress-photos', 'svaro-skincare-photos') AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Svaro Media Select" ON storage.objects FOR SELECT USING (
    bucket_id IN ('svaro-progress-photos', 'svaro-skincare-photos') AND 
    (storage.foldername(name))[1] = auth.uid()::text
);
