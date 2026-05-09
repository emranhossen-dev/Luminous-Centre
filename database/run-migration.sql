-- Run this SQL to fix your database schema for course outline functionality
-- Execute this in your Supabase SQL Editor or database client

-- Step 1: Add course_outline_url field if it doesn't exist
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS course_outline_url TEXT;

-- Step 2: Add comment for documentation
COMMENT ON COLUMN courses.course_outline_url IS 'URL to the course outline PDF file stored in Supabase Storage bucket "course-outlines"';

-- Step 3: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_courses_course_outline_url ON courses(course_outline_url) WHERE course_outline_url IS NOT NULL;

-- Step 4: Verify the field was added successfully
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'courses' AND column_name = 'course_outline_url';

-- Step 5: Show current status of course outlines
SELECT 
    COUNT(*) as total_courses,
    COUNT(course_outline_url) as courses_with_outline,
    COUNT(*) - COUNT(course_outline_url) as courses_without_outline
FROM courses;

-- Success message
SELECT 'Database schema updated successfully! course_outline_url field is now available.' as status;
