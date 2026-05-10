-- Fix users table by adding missing role column
-- This column is needed for admin authentication

-- Add role column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'student';

-- Update existing users to have appropriate roles
UPDATE users 
SET role = 'admin' 
WHERE email IN ('admin@luminous.com');

UPDATE users 
SET role = 'employee' 
WHERE email IN ('employee@luminous.com');

UPDATE users 
SET role = 'mentor' 
WHERE email IN ('mentor@luminous.com');

-- Verify the updated table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check users with their roles
SELECT id, email, name, role, created_at 
FROM users 
ORDER BY id;
