-- Complete courses table creation with course_outline_url
-- Run this in Supabase SQL Editor

-- Drop existing table (WARNING: This will delete all data!)
-- DROP TABLE IF EXISTS courses;

-- Create courses table with all required fields
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    old_price DECIMAL(10,2),
    
    -- Course outline PDF field
    course_outline_url TEXT,
    
    -- Image and media
    thumbnail_url TEXT,
    preview_video_url TEXT,
    
    -- Course details
    level VARCHAR(50) DEFAULT 'beginner',
    language VARCHAR(50) DEFAULT 'bangla',
    duration_weeks INTEGER,
    total_hours INTEGER,
    badge VARCHAR(100),
    current_price DECIMAL(10,2),
    regular_price DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'TK',
    classes_count INTEGER,
    projects_count INTEGER,
    
    -- Status and dates
    status VARCHAR(20) DEFAULT 'draft',
    featured BOOLEAN DEFAULT false,
    access_type VARCHAR(50) DEFAULT 'public',
    enrollment_ends TIMESTAMP,
    class_starts TIMESTAMP,
    selected_days TEXT[],
    
    -- Metadata
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_featured ON courses(featured);
CREATE INDEX IF NOT EXISTS idx_courses_course_outline_url ON courses(course_outline_url) WHERE course_outline_url IS NOT NULL;

-- Add comments for documentation
COMMENT ON TABLE courses IS 'Courses table with PDF outline support';
COMMENT ON COLUMN courses.course_outline_url IS 'URL to the course outline PDF file stored in Supabase Storage';

-- Verify table creation
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'courses' 
ORDER BY ordinal_position;

SELECT 'Courses table created successfully!' as status;
