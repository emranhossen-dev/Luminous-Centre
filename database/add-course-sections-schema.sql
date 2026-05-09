-- Create course sections and lessons schema
CREATE TABLE IF NOT EXISTS course_sections (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    is_free BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS course_lessons (
    id SERIAL PRIMARY KEY,
    section_id INTEGER REFERENCES course_sections(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    video_url TEXT,
    duration_minutes INTEGER,
    order_index INTEGER NOT NULL,
    is_free BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lesson_resources (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER REFERENCES course_lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'pdf', 'video', 'link', 'code', 'image', etc.
    url TEXT,
    file_path TEXT,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lesson_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES course_lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    completion_time TIMESTAMP,
    watch_time_minutes INTEGER DEFAULT 0,
    last_position INTEGER DEFAULT 0, -- for video lessons
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_course_sections_course ON course_sections(course_id);
CREATE INDEX IF NOT EXISTS idx_course_sections_order ON course_sections(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_course_lessons_section ON course_lessons(section_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_order ON course_lessons(section_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lesson_resources_lesson ON lesson_resources(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON lesson_progress(lesson_id);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_course_sections_updated_at
    BEFORE UPDATE ON course_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_lessons_updated_at
    BEFORE UPDATE ON course_lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_progress_updated_at
    BEFORE UPDATE ON lesson_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
