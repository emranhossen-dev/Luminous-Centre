-- Check if course_outline_url field exists in database
-- Run this in Supabase SQL Editor to verify

SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'courses' 
    AND column_name IN ('id', 'title', 'course_outline_url')
ORDER BY column_name;

-- Check current data status
SELECT 
    COUNT(*) as total_courses,
    COUNT(course_outline_url) as courses_with_outline,
    COUNT(*) - COUNT(course_outline_url) as courses_without_outline
FROM courses;

-- Show sample data
SELECT 
    id, 
    title, 
    course_outline_url,
    CASE 
        WHEN course_outline_url IS NOT NULL AND course_outline_url != '' THEN 'HAS OUTLINE'
        ELSE 'NO OUTLINE'
    END as outline_status
FROM courses 
ORDER BY id 
LIMIT 5;
