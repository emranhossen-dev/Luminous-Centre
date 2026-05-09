-- Test manual insert to verify database connection
-- Run this in Supabase SQL Editor

-- Test insert with sample data
INSERT INTO courses (
    title, 
    slug, 
    category, 
    price, 
    old_price,
    course_outline_url,
    created_by,
    created_at
) VALUES (
    'Test Course',
    'test-course',
    'online',
    1000,
    1500,
    'https://example.com/test.pdf',
    1,
    CURRENT_TIMESTAMP
);

-- Verify insert worked
SELECT * FROM courses WHERE slug = 'test-course';

-- Clean up test data
-- DELETE FROM courses WHERE slug = 'test-course';

SELECT 'Database connection test completed!' as result;
