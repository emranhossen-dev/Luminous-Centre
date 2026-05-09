-- Add course_outline_url field to courses table
-- This field will store the URL to the course outline PDF stored in Supabase Storage

ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS course_outline_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN courses.course_outline_url IS 'URL to the course outline PDF file stored in Supabase Storage bucket "course-outlines"';
