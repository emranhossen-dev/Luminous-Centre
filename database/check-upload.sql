-- Check if PDF upload is working
-- Run this after uploading a PDF

-- Check latest course with PDF
SELECT 
    id, 
    title, 
    course_outline_url,
    updated_at
FROM courses 
WHERE course_outline_url IS NOT NULL 
ORDER BY updated_at DESC 
LIMIT 5;

-- Check specific course (change ID as needed)
SELECT 
    id, 
    title, 
    course_outline_url,
    CASE 
        WHEN course_outline_url IS NOT NULL AND course_outline_url != '' THEN 'HAS PDF'
        ELSE 'NO PDF'
    END as status
FROM courses 
WHERE id = 32; -- Change this to your course ID

-- Count total courses with PDFs
SELECT 
    COUNT(*) as total_courses,
    COUNT(course_outline_url) as courses_with_pdf
FROM courses;
