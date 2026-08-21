-- Phase 7: Study, Career, Projects, Finance Domains

DO $$
BEGIN

    -- Extend existing goals
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'goals' AND column_name = 'target_value') THEN
        ALTER TABLE public.goals ADD COLUMN target_value numeric;
        ALTER TABLE public.goals ADD COLUMN unit text;
        ALTER TABLE public.goals ADD COLUMN start_date bigint;
        ALTER TABLE public.goals ADD COLUMN end_date bigint;
        ALTER TABLE public.goals ADD COLUMN status text DEFAULT 'active';
        ALTER TABLE public.goals ADD COLUMN domain text DEFAULT 'general';
    END IF;

    -- Extend daily_tasks for cross-domain linkage
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_tasks' AND column_name = 'linked_entity_id') THEN
        ALTER TABLE public.daily_tasks ADD COLUMN linked_entity_id uuid;
        ALTER TABLE public.daily_tasks ADD COLUMN linked_domain text;
    END IF;

    -- STUDY
    CREATE TABLE IF NOT EXISTS public.study_subjects (
        id uuid PRIMARY KEY,
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
        name text NOT NULL,
        color text,
        created_at bigint NOT NULL,
        updated_at bigint NOT NULL,
        privacy_level text DEFAULT 'PRIVATE',
        sync_state text DEFAULT 'SYNCED',
        deleted boolean DEFAULT false
    );

    CREATE TABLE IF NOT EXISTS public.study_sessions (
        id uuid PRIMARY KEY,
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
        subject_id uuid,
        start_time bigint NOT NULL,
        end_time bigint,
        duration_minutes integer,
        notes text,
        created_at bigint NOT NULL,
        updated_at bigint NOT NULL,
        privacy_level text DEFAULT 'PRIVATE',
        sync_state text DEFAULT 'SYNCED',
        deleted boolean DEFAULT false
    );

    CREATE TABLE IF NOT EXISTS public.exams (
        id uuid PRIMARY KEY,
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
        subject_id uuid,
        title text NOT NULL,
        date_time bigint NOT NULL,
        location text,
        status text DEFAULT 'upcoming',
        notes text,
        created_at bigint NOT NULL,
        updated_at bigint NOT NULL,
        privacy_level text DEFAULT 'PRIVATE',
        sync_state text DEFAULT 'SYNCED',
        deleted boolean DEFAULT false
    );

    CREATE TABLE IF NOT EXISTS public.assignments (
        id uuid PRIMARY KEY,
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
        subject_id uuid,
        title text NOT NULL,
        due_date bigint NOT NULL,
        priority integer DEFAULT 0,
        status text DEFAULT 'pending',
        created_at bigint NOT NULL,
        updated_at bigint NOT NULL,
        privacy_level text DEFAULT 'PRIVATE',
        sync_state text DEFAULT 'SYNCED',
        deleted boolean DEFAULT false
    );

    -- CAREER
    CREATE TABLE IF NOT EXISTS public.career_skills (
        id uuid PRIMARY KEY,
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
        name text NOT NULL,
        category text,
        current_level integer DEFAULT 0,
        target_level integer,
        notes text,
        created_at bigint NOT NULL,
        updated_at bigint NOT NULL,
        privacy_level text DEFAULT 'PRIVATE',
        sync_state text DEFAULT 'SYNCED',
        deleted boolean DEFAULT false
    );

    CREATE TABLE IF NOT EXISTS public.career_applications (
        id uuid PRIMARY KEY,
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
        company text NOT NULL,
        role text NOT NULL,
        application_date bigint,
        status text DEFAULT 'TARGET',
        source text,
        notes text,
        next_action text,
        deadline bigint,
        created_at bigint NOT NULL,
        updated_at bigint NOT NULL,
        privacy_level text DEFAULT 'PRIVATE',
        sync_state text DEFAULT 'SYNCED',
        deleted boolean DEFAULT false
    );

    -- PROJECTS
    CREATE TABLE IF NOT EXISTS public.projects (
        id uuid PRIMARY KEY,
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
        name text NOT NULL,
        description text,
        status text DEFAULT 'PLANNED',
        priority integer DEFAULT 0,
        deadline bigint,
        created_at bigint NOT NULL,
        updated_at bigint NOT NULL,
        privacy_level text DEFAULT 'PRIVATE',
        sync_state text DEFAULT 'SYNCED',
        deleted boolean DEFAULT false
    );

    CREATE TABLE IF NOT EXISTS public.project_milestones (
        id uuid PRIMARY KEY,
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
        project_id uuid,
        title text NOT NULL,
        deadline bigint,
        completed boolean DEFAULT false,
        created_at bigint NOT NULL,
        updated_at bigint NOT NULL,
        privacy_level text DEFAULT 'PRIVATE',
        sync_state text DEFAULT 'SYNCED',
        deleted boolean DEFAULT false
    );

    -- FINANCE
    CREATE TABLE IF NOT EXISTS public.finance_accounts (
        id uuid PRIMARY KEY,
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
        name text NOT NULL,
        type text NOT NULL,
        currency text DEFAULT 'USD',
        balance numeric DEFAULT 0,
        created_at bigint NOT NULL,
        updated_at bigint NOT NULL,
        privacy_level text DEFAULT 'PRIVATE',
        sync_state text DEFAULT 'SYNCED',
        deleted boolean DEFAULT false
    );

    CREATE TABLE IF NOT EXISTS public.finance_transactions (
        id uuid PRIMARY KEY,
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
        account_id uuid,
        target_account_id uuid,
        amount numeric NOT NULL,
        type text NOT NULL,
        category text,
        date bigint NOT NULL,
        description text,
        is_recurring boolean DEFAULT false,
        created_at bigint NOT NULL,
        updated_at bigint NOT NULL,
        privacy_level text DEFAULT 'PRIVATE',
        sync_state text DEFAULT 'SYNCED',
        deleted boolean DEFAULT false
    );

    CREATE TABLE IF NOT EXISTS public.finance_budgets (
        id uuid PRIMARY KEY,
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
        category text NOT NULL,
        amount numeric NOT NULL,
        period text DEFAULT 'MONTHLY',
        created_at bigint NOT NULL,
        updated_at bigint NOT NULL,
        privacy_level text DEFAULT 'PRIVATE',
        sync_state text DEFAULT 'SYNCED',
        deleted boolean DEFAULT false
    );

END $$;

-- Enable RLS on all new tables
ALTER TABLE public.study_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_budgets ENABLE ROW LEVEL SECURITY;

-- Apply standard multi-user RLS policies
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT unnest(ARRAY['study_subjects', 'study_sessions', 'exams', 'assignments', 'career_skills', 'career_applications', 'projects', 'project_milestones', 'finance_accounts', 'finance_transactions', 'finance_budgets'])
    LOOP
        EXECUTE format('CREATE POLICY "Users can manage own %I" ON public.%I FOR ALL USING (auth.uid() = user_id)', t, t);
    END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';
