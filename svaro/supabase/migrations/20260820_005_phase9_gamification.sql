-- Phase 9: Gamification & Virtual Economy

DO $$
BEGIN

    CREATE TABLE IF NOT EXISTS public.gamification_transactions (
        id uuid PRIMARY KEY,
        user_id uuid NOT NULL,
        currency_type text NOT NULL, -- 'XP' or 'CREDIT'
        amount int NOT NULL,
        idempotency_key text NOT NULL,
        description text,
        created_at bigint NOT NULL,
        updated_at bigint NOT NULL,
        privacy_level text DEFAULT 'PRIVATE',
        sync_state text DEFAULT 'synced',
        deleted boolean DEFAULT false
    );

    CREATE TABLE IF NOT EXISTS public.user_badges (
        id uuid PRIMARY KEY,
        user_id uuid NOT NULL,
        badge_id text NOT NULL,
        earned_at bigint NOT NULL,
        idempotency_key text NOT NULL,
        created_at bigint NOT NULL,
        updated_at bigint NOT NULL,
        privacy_level text DEFAULT 'PRIVATE',
        sync_state text DEFAULT 'synced',
        deleted boolean DEFAULT false
    );

    CREATE TABLE IF NOT EXISTS public.user_gamification_profile (
        id uuid PRIMARY KEY,
        user_id uuid NOT NULL UNIQUE,
        total_xp int DEFAULT 0,
        total_credits int DEFAULT 0,
        current_level int DEFAULT 1,
        created_at bigint NOT NULL,
        updated_at bigint NOT NULL,
        privacy_level text DEFAULT 'PRIVATE',
        sync_state text DEFAULT 'synced',
        deleted boolean DEFAULT false
    );

    -- Unique constraint to strictly prevent duplicates
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_gamification_idempotency') THEN
        CREATE UNIQUE INDEX idx_gamification_idempotency ON public.gamification_transactions (user_id, idempotency_key) WHERE deleted = false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_badges_idempotency') THEN
        CREATE UNIQUE INDEX idx_user_badges_idempotency ON public.user_badges (user_id, idempotency_key) WHERE deleted = false;
    END IF;

END $$;

-- Basic RLS
ALTER TABLE public.gamification_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gamification_profile ENABLE ROW LEVEL SECURITY;

-- We don't redefine the policies if they already exist, so we use PL/pgSQL
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_gamification_transactions') THEN
        CREATE POLICY user_gamification_transactions ON public.gamification_transactions FOR ALL USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_gamification_badges') THEN
        CREATE POLICY user_gamification_badges ON public.user_badges FOR ALL USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_gamification_profile') THEN
        CREATE POLICY user_gamification_profile ON public.user_gamification_profile FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';
