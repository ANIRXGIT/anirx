-- Phase 10: Owner Administration & Configuration

DO $$
BEGIN

    -- 1. System Config
    CREATE TABLE IF NOT EXISTS public.system_config (
        key text PRIMARY KEY,
        value jsonb NOT NULL,
        updated_at bigint NOT NULL,
        updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
        sync_state text DEFAULT 'synced',
        deleted boolean DEFAULT false
    );

    -- 2. Feature Flags
    CREATE TABLE IF NOT EXISTS public.feature_flags (
        flag text PRIMARY KEY,
        enabled boolean NOT NULL DEFAULT false,
        updated_at bigint NOT NULL,
        updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
        sync_state text DEFAULT 'synced',
        deleted boolean DEFAULT false
    );

END $$;

-- RLS
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'system_config_read_all') THEN
        CREATE POLICY system_config_read_all ON public.system_config FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'system_config_write_owner') THEN
        CREATE POLICY system_config_write_owner ON public.system_config FOR ALL USING (public.is_owner());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'feature_flags_read_all') THEN
        CREATE POLICY feature_flags_read_all ON public.feature_flags FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'feature_flags_write_owner') THEN
        CREATE POLICY feature_flags_write_owner ON public.feature_flags FOR ALL USING (public.is_owner());
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';
