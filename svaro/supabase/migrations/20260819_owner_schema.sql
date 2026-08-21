-- Migration: Setup Owner Mode Schema and RLS

-- 1. Owner Configuration
CREATE TABLE IF NOT EXISTS public.owner_config (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_email text UNIQUE NOT NULL
);

-- Seed an empty row or instruct the user to insert their email manually
-- INSERT INTO public.owner_config (owner_email) VALUES ('your_email@gmail.com');

-- 2. Owner Auth Check Function
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS boolean AS $$
DECLARE
    is_authorized boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM public.owner_config 
        WHERE owner_email = auth.jwt() ->> 'email'
    ) INTO is_authorized;
    
    RETURN is_authorized;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Mirrored Application Schema (Owner specific)

CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY,
    owner_id uuid NOT NULL REFERENCES auth.users(id),
    name text,
    age integer,
    height_cm numeric,
    weight_kg numeric,
    activity_level text,
    transformation_duration_days integer,
    created_at bigint,
    updated_at bigint
);

CREATE TABLE IF NOT EXISTS public.goals (
    id uuid PRIMARY KEY,
    owner_id uuid NOT NULL REFERENCES auth.users(id),
    type text,
    target_weight_kg numeric,
    priority text,
    created_at bigint
);

CREATE TABLE IF NOT EXISTS public.nutrition_targets (
    id uuid PRIMARY KEY,
    owner_id uuid NOT NULL REFERENCES auth.users(id),
    calories integer,
    protein integer,
    carbs integer,
    fat integer,
    created_at bigint
);

CREATE TABLE IF NOT EXISTS public.exercises (
    id uuid PRIMARY KEY,
    owner_id uuid NOT NULL REFERENCES auth.users(id),
    name text,
    muscle_group text,
    equipment text,
    youtube_url text,
    alternatives jsonb
);

CREATE TABLE IF NOT EXISTS public.workout_templates (
    id uuid PRIMARY KEY,
    owner_id uuid NOT NULL REFERENCES auth.users(id),
    name text,
    exercises jsonb,
    active boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.challenge_templates (
    id uuid PRIMARY KEY,
    owner_id uuid NOT NULL REFERENCES auth.users(id),
    name text,
    requirements jsonb,
    completion_threshold integer,
    active boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.task_templates (
    id uuid PRIMARY KEY,
    owner_id uuid NOT NULL REFERENCES auth.users(id),
    title text,
    category text,
    frequency text,
    active boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.supplement_templates (
    id uuid PRIMARY KEY,
    owner_id uuid NOT NULL REFERENCES auth.users(id),
    name text,
    dose text,
    unit text,
    frequency text,
    time_of_day text,
    active boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.workout_sessions (
    id uuid PRIMARY KEY,
    owner_id uuid NOT NULL REFERENCES auth.users(id),
    template_id text,
    name text,
    start_time bigint,
    end_time bigint,
    completed boolean,
    notes text
);

CREATE TABLE IF NOT EXISTS public.set_logs (
    id uuid PRIMARY KEY,
    owner_id uuid NOT NULL REFERENCES auth.users(id),
    session_id text,
    exercise_id text,
    set_number integer,
    weight_kg numeric,
    reps integer,
    rpe numeric,
    rir numeric,
    completed boolean
);

CREATE TABLE IF NOT EXISTS public.food_logs (
    id uuid PRIMARY KEY,
    owner_id uuid NOT NULL REFERENCES auth.users(id),
    food_id text,
    name text,
    amount numeric,
    calories integer,
    protein integer,
    carbs integer,
    fat integer,
    fiber integer,
    timestamp bigint
);

CREATE TABLE IF NOT EXISTS public.weight_logs (
    id uuid PRIMARY KEY,
    owner_id uuid NOT NULL REFERENCES auth.users(id),
    weight_kg numeric,
    timestamp bigint
);

CREATE TABLE IF NOT EXISTS public.measurement_logs (
    id uuid PRIMARY KEY,
    owner_id uuid NOT NULL REFERENCES auth.users(id),
    timestamp bigint,
    type text,
    value numeric,
    unit text,
    notes text
);

CREATE TABLE IF NOT EXISTS public.progress_photos (
    id uuid PRIMARY KEY,
    owner_id uuid NOT NULL REFERENCES auth.users(id),
    timestamp bigint,
    category text,
    weight numeric,
    day_of_transformation integer,
    notes text,
    storage_path text
);

CREATE TABLE IF NOT EXISTS public.water_logs (
    id uuid PRIMARY KEY,
    owner_id uuid NOT NULL REFERENCES auth.users(id),
    amount_ml integer,
    timestamp bigint
);

CREATE TABLE IF NOT EXISTS public.step_logs (
    id uuid PRIMARY KEY,
    owner_id uuid NOT NULL REFERENCES auth.users(id),
    steps integer,
    timestamp bigint
);

CREATE TABLE IF NOT EXISTS public.sleep_logs (
    id uuid PRIMARY KEY,
    owner_id uuid NOT NULL REFERENCES auth.users(id),
    duration_minutes integer,
    quality text,
    timestamp bigint
);

CREATE TABLE IF NOT EXISTS public.daily_tasks (
    id uuid PRIMARY KEY,
    owner_id uuid NOT NULL REFERENCES auth.users(id),
    title text,
    completed boolean,
    timestamp bigint
);

CREATE TABLE IF NOT EXISTS public.habit_logs (
    id uuid PRIMARY KEY,
    owner_id uuid NOT NULL REFERENCES auth.users(id),
    habit_id text,
    completed boolean,
    timestamp bigint
);

CREATE TABLE IF NOT EXISTS public.skincare_products (
    id uuid PRIMARY KEY,
    owner_id uuid NOT NULL REFERENCES auth.users(id),
    name text,
    brand text,
    category text,
    start_date bigint,
    end_date bigint,
    frequency text,
    active boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.skincare_routines (
    id uuid PRIMARY KEY,
    owner_id uuid NOT NULL REFERENCES auth.users(id),
    type text, -- 'AM' | 'PM'
    timestamp bigint,
    completed boolean,
    products_used jsonb,
    notes text
);

CREATE TABLE IF NOT EXISTS public.skincare_logs (
    id uuid PRIMARY KEY,
    owner_id uuid NOT NULL REFERENCES auth.users(id),
    timestamp bigint,
    acne boolean,
    dryness boolean,
    oiliness boolean,
    redness boolean,
    texture text,
    pigmentation boolean,
    notes text
);

CREATE TABLE IF NOT EXISTS public.cloud_backups (
    id uuid PRIMARY KEY,
    owner_id uuid NOT NULL REFERENCES auth.users(id),
    timestamp bigint,
    payload jsonb,
    device_info text
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.owner_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplement_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.set_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurement_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.step_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skincare_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skincare_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skincare_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cloud_backups ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Only the owner can read/write to the owner_config table to avoid enumeration
CREATE POLICY "Owner Config Read" ON public.owner_config FOR SELECT USING (auth.jwt() ->> 'email' = owner_email);
CREATE POLICY "Owner Config Insert" ON public.owner_config FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = owner_email);
CREATE POLICY "Owner Config Update" ON public.owner_config FOR UPDATE USING (auth.jwt() ->> 'email' = owner_email);

-- Universal policy function for all owner tables
CREATE OR REPLACE FUNCTION create_owner_policy(table_name text) RETURNS void AS $$
BEGIN
    EXECUTE format('CREATE POLICY "Owner Access %I" ON public.%I FOR ALL USING (auth.uid() = owner_id AND is_owner())', table_name, table_name);
END;
$$ LANGUAGE plpgsql;

SELECT create_owner_policy('profiles');
SELECT create_owner_policy('goals');
SELECT create_owner_policy('nutrition_targets');
SELECT create_owner_policy('exercises');
SELECT create_owner_policy('workout_templates');
SELECT create_owner_policy('challenge_templates');
SELECT create_owner_policy('task_templates');
SELECT create_owner_policy('supplement_templates');
SELECT create_owner_policy('workout_sessions');
SELECT create_owner_policy('set_logs');
SELECT create_owner_policy('food_logs');
SELECT create_owner_policy('weight_logs');
SELECT create_owner_policy('measurement_logs');
SELECT create_owner_policy('progress_photos');
SELECT create_owner_policy('water_logs');
SELECT create_owner_policy('step_logs');
SELECT create_owner_policy('sleep_logs');
SELECT create_owner_policy('daily_tasks');
SELECT create_owner_policy('habit_logs');
SELECT create_owner_policy('skincare_products');
SELECT create_owner_policy('skincare_routines');
SELECT create_owner_policy('skincare_logs');
SELECT create_owner_policy('cloud_backups');

-- 6. Setup Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('owner_progress_photos', 'owner_progress_photos', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('owner_skincare_photos', 'owner_skincare_photos', false) ON CONFLICT DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Storage Policies for Progress Photos
CREATE POLICY "Owner Progress Photos Access" ON storage.objects FOR ALL USING (
    bucket_id = 'owner_progress_photos' 
    AND auth.uid() = owner_id 
    AND public.is_owner()
);

-- Storage Policies for Skincare Photos
CREATE POLICY "Owner Skincare Photos Access" ON storage.objects FOR ALL USING (
    bucket_id = 'owner_skincare_photos' 
    AND auth.uid() = owner_id 
    AND public.is_owner()
);
