import { query } from './database';

export async function ensureLMSFeaturesSchema(): Promise<void> {
  // 1. Create class_recordings table
  await query(`
    CREATE TABLE IF NOT EXISTS class_recordings (
      id SERIAL PRIMARY KEY,
      course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      video_url TEXT NOT NULL,
      thumbnail_url TEXT,
      download_url TEXT,
      duration VARCHAR(50),
      views INTEGER DEFAULT 0,
      recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Create assignments table
  await query(`
    CREATE TABLE IF NOT EXISTS assignments (
      id SERIAL PRIMARY KEY,
      course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      max_marks DECIMAL(5,2) DEFAULT 100,
      due_date TIMESTAMP,
      file_url TEXT,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 3. Create assignment_submissions table
  await query(`
    CREATE TABLE IF NOT EXISTS assignment_submissions (
      id SERIAL PRIMARY KEY,
      assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      submission_url TEXT NOT NULL,
      student_comment TEXT,
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      marks_obtained DECIMAL(5,2),
      mentor_feedback TEXT,
      graded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      graded_at TIMESTAMP
    )
  `);

  console.log('LMS Features Tables (recordings, assignments, submissions) ensured successfully.');
}
