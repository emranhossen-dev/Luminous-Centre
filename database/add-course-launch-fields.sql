-- Add new fields for course launch form
ALTER TABLE courses ADD COLUMN IF NOT EXISTS enrollment_ends DATE;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS class_starts DATE;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS selected_days JSONB DEFAULT '[]';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_courses_enrollment_ends ON courses(enrollment_ends);
CREATE INDEX IF NOT EXISTS idx_courses_class_starts ON courses(class_starts);
CREATE INDEX IF NOT EXISTS idx_courses_selected_days ON courses USING GIN(selected_days);
