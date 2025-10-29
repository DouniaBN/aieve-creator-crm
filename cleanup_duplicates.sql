-- Clean up duplicate user profiles
-- First, check how many duplicates exist
SELECT user_id, COUNT(*) as duplicate_count
FROM user_profiles
WHERE user_id = 'cbcdb7e1-f95a-4d31-a398-4afcfa3352b1'
GROUP BY user_id;

-- Delete all duplicate profiles except the most recent one
DELETE FROM user_profiles
WHERE user_id = 'cbcdb7e1-f95a-4d31-a398-4afcfa3352b1'
AND id NOT IN (
  SELECT id FROM user_profiles
  WHERE user_id = 'cbcdb7e1-f95a-4d31-a398-4afcfa3352b1'
  ORDER BY created_at DESC
  LIMIT 1
);

-- Add unique constraint to prevent future duplicates
ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_user_id_unique UNIQUE (user_id);