-- Add test data for course outline functionality
-- Run this to add sample PDF URLs to existing courses

-- First, check if we have any courses
SELECT id, title FROM courses LIMIT 5;

-- Add test PDF URL to first few courses (for testing)
UPDATE courses 
SET course_outline_url = 'https://supabase.com/storage/v1/object/public/course-outlines/test-course-outline.pdf'
WHERE id IN (
    SELECT id FROM courses 
    WHERE course_outline_url IS NULL 
    LIMIT 3
);

-- Show updated courses
SELECT 
    id, 
    title, 
    course_outline_url,
    CASE 
        WHEN course_outline_url IS NOT NULL THEN 'HAS OUTLINE'
        ELSE 'NO OUTLINE'
    END as status
FROM courses 
ORDER BY id 
LIMIT 5;

-- Count results
SELECT 
    COUNT(*) as total_courses,
    COUNT(course_outline_url) as courses_with_outline
FROM courses;
