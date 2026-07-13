CREATE TABLE IF NOT EXISTS lesson_videos (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER, -- references curriculum_topics.id
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  telegram_file_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  duration VARCHAR(50),
  thumbnail VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lesson_videos_lesson ON lesson_videos(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_videos_course ON lesson_videos(course_id);
