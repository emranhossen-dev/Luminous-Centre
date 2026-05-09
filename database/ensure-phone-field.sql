-- Ensure phone field exists in users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Create index for phone field for better performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
