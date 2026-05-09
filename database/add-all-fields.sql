-- Complete database setup for course outline functionality
-- Run this entire script in Supabase SQL Editor

-- Step 1: Add course_outline_url field if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'course_outline_url'
    ) THEN
        ALTER TABLE courses ADD COLUMN course_outline_url TEXT;
        RAISE NOTICE 'Added course_outline_url column';
    ELSE
        RAISE NOTICE 'course_outline_url column already exists';
    END IF;
END $$;

-- Step 2: Add comment
COMMENT ON COLUMN courses.course_outline_url IS 'URL to the course outline PDF file stored in Supabase Storage bucket "course-outlines"';

-- Step 3: Create index
CREATE INDEX IF NOT EXISTS idx_courses_course_outline_url ON courses(course_outline_url) WHERE course_outline_url IS NOT NULL;

-- Step 4: Verify field exists
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'courses' AND column_name = 'course_outline_url';

-- Step 5: Add sample data for testing (optional)
UPDATE courses 
SET course_outline_url = 'https://example.com/sample-outline.pdf' 
WHERE id = 1 AND course_outline_url IS NULL;

-- Step 6: Show results
SELECT 
    COUNT(*) as total_courses,
    COUNT(course_outline_url) as courses_with_outline,
    COUNT(*) - COUNT(course_outline_url) as courses_without_outline
FROM courses;

SELECT 'Database setup completed!' as status;
