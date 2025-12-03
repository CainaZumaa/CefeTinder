-- Add last_super_like column to users table
ALTER TABLE users ADD COLUMN last_super_like TIMESTAMP WITH TIME ZONE;

-- Add comment to explain the column
COMMENT ON COLUMN users.last_super_like IS 'Timestamp of the last super like sent by this user. Used to enforce 24-hour cooldown.';

