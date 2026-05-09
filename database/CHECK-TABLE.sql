-- Check if courses table was created successfully
-- Run this in Supabase SQL Editor

-- Check if table exists
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'courses';

-- Check table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'courses' 
ORDER BY ordinal_position;

-- Check if course_outline_url field exists
SELECT 
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'courses' AND column_name = 'course_outline_url';

-- Show sample data (if any)
SELECT COUNT(*) as total_courses FROM courses;

-- Show first few rows (if any)
SELECT id, title, course_outline_url, created_at 
FROM courses 
ORDER BY id 
LIMIT 5;

SELECT 'Table check completed!' as status;
