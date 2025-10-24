-- Migration to add onboarding fields to user_profiles table
-- Run this in your Supabase SQL editor

-- Add new columns to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS preferred_name TEXT,
ADD COLUMN IF NOT EXISTS creator_type TEXT CHECK (creator_type IN ('ugc_creator', 'content_creator', 'both')),
ADD COLUMN IF NOT EXISTS main_platform TEXT CHECK (main_platform IN ('instagram', 'tiktok', 'youtube', 'other'));

-- Update existing user profiles to have onboarding_complete = false if not set
UPDATE user_profiles
SET onboarding_complete = FALSE
WHERE onboarding_complete IS NULL;

-- Make onboarding_complete NOT NULL after setting defaults
ALTER TABLE user_profiles
ALTER COLUMN onboarding_complete SET NOT NULL;

-- Update existing profiles to include email from auth.users if missing
UPDATE user_profiles
SET email = auth.users.email
FROM auth.users
WHERE user_profiles.user_id = auth.users.id
AND user_profiles.email IS NULL;