-- Add onboarding fields to user_profiles table
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS preferred_name text,
ADD COLUMN IF NOT EXISTS creator_type text,
ADD COLUMN IF NOT EXISTS main_platform text,
ADD COLUMN IF NOT EXISTS onboarding_complete boolean default false,
ADD COLUMN IF NOT EXISTS business_name text,
ADD COLUMN IF NOT EXISTS tax_id text,
ADD COLUMN IF NOT EXISTS instagram_handle text,
ADD COLUMN IF NOT EXISTS youtube_handle text;