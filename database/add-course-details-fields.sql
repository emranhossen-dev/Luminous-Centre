-- Add course details fields to courses table
-- These fields support the course details page and banner functionality

-- Add course details specific columns
ALTER TABLE courses ADD COLUMN IF NOT EXISTS badge VARCHAR(50) DEFAULT 'Online Course';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS current_price DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS regular_price DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'TK';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS classes_count VARCHAR(20) DEFAULT '60+';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS projects_count VARCHAR(20) DEFAULT '12+';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS enrollment_deadline TIMESTAMP;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS class_start_date TIMESTAMP;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add learning_outcomes as JSONB column
ALTER TABLE courses ADD COLUMN IF NOT EXISTS learning_outcomes JSONB DEFAULT '[]';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_courses_badge ON courses(badge);
CREATE INDEX IF NOT EXISTS idx_courses_enrollment_deadline ON courses(enrollment_deadline);
CREATE INDEX IF NOT EXISTS idx_courses_class_start_date ON courses(class_start_date);
