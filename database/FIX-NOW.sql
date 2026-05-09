-- IMMEDIATE FIX - Run this in Supabase SQL Editor

-- Step 1: Force add the field
ALTER TABLE courses ADD COLUMN IF NOT EXISTS course_outline_url TEXT;

-- Step 2: Add test data to course ID 32 (the one you're seeing)
UPDATE courses 
SET course_outline_url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
WHERE id = 32 AND course_outline_url IS NULL;

-- Step 3: Verify it worked
SELECT 
    id, 
    title, 
    course_outline_url,
    CASE 
        WHEN course_outline_url IS NOT NULL THEN 'HAS OUTLINE'
        ELSE 'NO OUTLINE'
    END as status
FROM courses 
WHERE id = 32;

-- Step 4: Show all courses with outlines
SELECT 
    COUNT(*) as total_courses,
    COUNT(course_outline_url) as with_outline
FROM courses;

SELECT 'FIX COMPLETED! Refresh your website now.' as result;
