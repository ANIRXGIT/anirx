-- Phase 8: Recommendations AI Upgrades

DO $$
BEGIN

    -- Extend existing recommendations table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recommendations' AND column_name = 'related_entity_id') THEN
        ALTER TABLE public.recommendations ADD COLUMN related_entity_id uuid;
        ALTER TABLE public.recommendations ADD COLUMN related_entity_type text;
        ALTER TABLE public.recommendations ADD COLUMN action_type text;
        ALTER TABLE public.recommendations ADD COLUMN action_payload jsonb;
        ALTER TABLE public.recommendations ADD COLUMN confidence numeric;
        ALTER TABLE public.recommendations ADD COLUMN source text DEFAULT 'DETERMINISTIC';
        ALTER TABLE public.recommendations ADD COLUMN expires_at bigint;
    END IF;

END $$;

NOTIFY pgrst, 'reload schema';
