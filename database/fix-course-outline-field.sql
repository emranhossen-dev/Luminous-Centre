-- Complete database schema fix for course outline functionality
-- This script ensures all necessary fields and indexes exist

-- 1. Add course_outline_url field if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'course_outline_url'
    ) THEN
        ALTER TABLE courses ADD COLUMN course_outline_url TEXT;
        COMMENT ON COLUMN courses.course_outline_url IS 'URL to the course outline PDF file stored in Supabase Storage bucket "course-outlines"';
        RAISE NOTICE 'Added course_outline_url column to courses table';
    ELSE
        RAISE NOTICE 'course_outline_url column already exists in courses table';
    END IF;
END $$;

-- 2. Create index for course_outline_url for better query performance
CREATE INDEX IF NOT EXISTS idx_courses_course_outline_url ON courses(course_outline_url) WHERE course_outline_url IS NOT NULL;

-- 3. Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'courses' 
    AND column_name IN ('id', 'title', 'slug', 'course_outline_url', 'price', 'old_price')
ORDER BY column_name;

-- 4. Check if any courses already have course_outline_url values
SELECT 
    COUNT(*) as total_courses,
    COUNT(course_outline_url) as courses_with_outline,
    COUNT(*) - COUNT(course_outline_url) as courses_without_outline
FROM courses;

-- 5. Show sample data (if any courses have outline URLs)
SELECT 
    id, 
    title, 
    slug,
    course_outline_url,
    CASE 
        WHEN course_outline_url IS NOT NULL AND course_outline_url != '' THEN 'Has Outline'
        ELSE 'No Outline'
    END as outline_status
FROM courses 
ORDER BY id 
LIMIT 5;
