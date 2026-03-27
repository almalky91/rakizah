
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS trial_ends_at timestamp with time zone DEFAULT (now() + interval '1 day'),
ADD COLUMN IF NOT EXISTS subscription_active boolean NOT NULL DEFAULT false;

-- Set existing teachers: if created more than 1 day ago, trial expired and not active
-- For new teachers, the trigger will set trial_ends_at automatically
UPDATE public.profiles SET trial_ends_at = created_at + interval '1 day' WHERE trial_ends_at IS NULL;
