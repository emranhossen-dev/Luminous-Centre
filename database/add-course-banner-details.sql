-- Add banner and marketing details to courses table
ALTER TABLE courses 
ADD COLUMN banner_url TEXT,
ADD COLUMN promo_video_url TEXT,
ADD COLUMN preview_video_url TEXT,
ADD COLUMN short_description TEXT,
ADD COLUMN language VARCHAR(50) DEFAULT 'english',
ADD COLUMN level VARCHAR(20) DEFAULT 'beginner',
ADD COLUMN duration_weeks INTEGER,
ADD COLUMN total_hours INTEGER,
ADD COLUMN requirements TEXT,
ADD COLUMN what_you_learn TEXT,
ADD COLUMN target_audience TEXT,
ADD COLUMN materials_included TEXT,
ADD COLUMN certificate_included BOOLEAN DEFAULT true,
ADD COLUMN rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN review_count INTEGER DEFAULT 0,
ADD COLUMN featured BOOLEAN DEFAULT false,
ADD COLUMN tags TEXT[];

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_featured ON courses(featured);
CREATE INDEX IF NOT EXISTS idx_courses_rating ON courses(rating DESC);
CREATE INDEX IF NOT EXISTS idx_courses_category_level ON courses(category, level);

-- Update existing courses with default values
UPDATE courses 
SET 
  short_description = COALESCE(short_description, SUBSTRING(description, 1, 200)),
  language = COALESCE(language, 'english'),
  level = COALESCE(level, 'beginner'),
  certificate_included = COALESCE(certificate_included, true),
  featured = COALESCE(featured, false)
WHERE short_description IS NULL OR language IS NULL OR level IS NULL OR certificate_included IS NULL OR featured IS NULL;
