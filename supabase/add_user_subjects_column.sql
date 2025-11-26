-- Add subjects column to users table
-- This stores an array of subject IDs that the user is enrolled in
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS subjects UUID[] DEFAULT '{}';

-- Create an index for faster searching if needed (GIN index for arrays)
CREATE INDEX IF NOT EXISTS idx_users_subjects ON users USING GIN (subjects);

-- Comment explaining the column
COMMENT ON COLUMN users.subjects IS 'Array of subject IDs that the user is enrolled in';
