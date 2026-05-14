-- Create curriculum tables for course modules with topics and achievements
-- Run this in Supabase SQL Editor

-- Drop existing tables if they exist (WARNING: This will delete all data!)
-- DROP TABLE IF EXISTS curriculum_achievements;
-- DROP TABLE IF EXISTS curriculum_topics;
-- DROP TABLE IF EXISTS curriculum_modules;

-- Create curriculum_modules table
CREATE TABLE IF NOT EXISTS curriculum_modules (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create curriculum_topics table (for "Topic will Cover")
CREATE TABLE IF NOT EXISTS curriculum_topics (
  id SERIAL PRIMARY KEY,
  module_id INTEGER REFERENCES curriculum_modules(id) ON DELETE CASCADE,
  topic_name VARCHAR(500) NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create curriculum_achievements table (for "What you will be able to do")
CREATE TABLE IF NOT EXISTS curriculum_achievements (
  id SERIAL PRIMARY KEY,
  module_id INTEGER REFERENCES curriculum_modules(id) ON DELETE CASCADE,
  achievement_text VARCHAR(500) NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_curriculum_modules_course ON curriculum_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_modules_order ON curriculum_modules(order_index);
CREATE INDEX IF NOT EXISTS idx_curriculum_topics_module ON curriculum_topics(module_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_topics_order ON curriculum_topics(order_index);
CREATE INDEX IF NOT EXISTS idx_curriculum_achievements_module ON curriculum_achievements(module_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_achievements_order ON curriculum_achievements(order_index);

-- Add comments for documentation
COMMENT ON TABLE curriculum_modules IS 'Curriculum modules for courses with topics and achievements';
COMMENT ON TABLE curriculum_topics IS 'Topics covered in each curriculum module';
COMMENT ON TABLE curriculum_achievements IS 'Achievements/skills gained after completing each module';

-- Verify table creation
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('curriculum_modules', 'curriculum_topics', 'curriculum_achievements')
ORDER BY table_name, ordinal_position;

SELECT 'Curriculum tables created successfully!' as status;
