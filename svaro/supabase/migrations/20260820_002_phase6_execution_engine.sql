-- Phase 6: Execution Engine Updates
-- Safely add columns to support the new deterministic execution engines

DO $$
BEGIN
    -- Add columns to daily_tasks if they do not exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_tasks' AND column_name = 'status') THEN
        ALTER TABLE public.daily_tasks ADD COLUMN status text NOT NULL DEFAULT 'pending';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_tasks' AND column_name = 'due_date') THEN
        ALTER TABLE public.daily_tasks ADD COLUMN due_date bigint;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_tasks' AND column_name = 'priority') THEN
        ALTER TABLE public.daily_tasks ADD COLUMN priority integer DEFAULT 0;
    END IF;

    -- Add columns to habits
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'habits' AND column_name = 'description') THEN
        ALTER TABLE public.habits ADD COLUMN description text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'habits' AND column_name = 'start_date') THEN
        ALTER TABLE public.habits ADD COLUMN start_date bigint;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'habits' AND column_name = 'end_date') THEN
        ALTER TABLE public.habits ADD COLUMN end_date bigint;
    END IF;

    -- Add columns to habit_logs
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'habit_logs' AND column_name = 'status') THEN
        ALTER TABLE public.habit_logs ADD COLUMN status text DEFAULT 'completed';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'habit_logs' AND column_name = 'completion_value') THEN
        ALTER TABLE public.habit_logs ADD COLUMN completion_value numeric;
    END IF;
END $$;

-- Let the sync engine RPC pick up the new schema columns by reloading schema cache
NOTIFY pgrst, 'reload schema';
