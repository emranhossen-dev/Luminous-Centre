-- Add google_id column to users table for Google OAuth authentication
ALTER TABLE users ADD COLUMN google_id VARCHAR(255);

-- Create index for google_id for better performance
CREATE INDEX idx_users_google_id ON users(google_id);
