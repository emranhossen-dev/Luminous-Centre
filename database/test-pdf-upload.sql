-- Test PDF upload functionality
-- This script helps verify the upload process works end-to-end

-- 1. Check if storage bucket exists (if you have access to storage metadata)
-- Note: This might not work in all Supabase setups
-- SELECT * FROM pg_tables WHERE tablename LIKE '%storage%';

-- 2. Insert a test course with PDF URL
INSERT INTO courses (
    title, 
    slug, 
    description, 
    category, 
    price, 
    old_price,
    status,
    course_outline_url,
    created_by
) VALUES (
    'Test Course with PDF',
    'test-course-pdf',
    'This is a test course to verify PDF download functionality',
    'online',
    1000,
    1500,
    'published',
    'https://supabase.com/storage/v1/object/public/course-outlines/test-course-outline.pdf',
    1 -- Assuming user ID 1 exists
) ON CONFLICT (slug) DO NOTHING;

-- 3. Verify the test course was created
SELECT 
    id, 
    title, 
    slug, 
    course_outline_url,
    CASE 
        WHEN course_outline_url IS NOT NULL THEN 'PDF URL EXISTS'
        ELSE 'NO PDF URL'
    END as pdf_status
FROM courses 
WHERE slug = 'test-course-pdf';

-- 4. Show all courses with PDF URLs
SELECT 
    id, 
    title, 
    course_outline_url
FROM courses 
WHERE course_outline_url IS NOT NULL
ORDER BY id;

SELECT 'Test data setup completed!' as status;
