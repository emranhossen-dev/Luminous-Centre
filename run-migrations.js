import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '6543'),
  ssl: { rejectUnauthorized: false },
});

async function runMigration() {
  try {
    console.log('1. Creating mentors...');
    await pool.query(`CREATE TABLE IF NOT EXISTS mentors (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(50),
      avatar TEXT,
      bio TEXT,
      designation VARCHAR(255),
      experience VARCHAR(100),
      skills TEXT[],
      linkedin TEXT,
      github TEXT,
      website TEXT,
      status VARCHAR(50) DEFAULT 'active',
      rating DECIMAL(3, 2) DEFAULT 0.0,
      total_students INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP WITH TIME ZONE
    )`);

    console.log('2. Creating students...');
    await pool.query(`CREATE TABLE IF NOT EXISTS students (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(50),
      avatar TEXT,
      department VARCHAR(255),
      designation VARCHAR(255),
      mentor_id UUID REFERENCES mentors(id) ON DELETE SET NULL,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP WITH TIME ZONE
    )`);

    console.log('3. Altering courses...');
    await pool.query(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS mentor_id UUID REFERENCES mentors(id) ON DELETE SET NULL`);

    console.log('4. Altering enrollments...');
    await pool.query(`ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES students(id) ON DELETE CASCADE`);

    console.log('5. Creating quizzes...');
    await pool.query(`CREATE TABLE IF NOT EXISTS quizzes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      description TEXT,
      course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
      mentor_id UUID REFERENCES mentors(id) ON DELETE SET NULL,
      duration INTEGER NOT NULL,
      passing_score DECIMAL(5, 2) NOT NULL,
      attempt_limit INTEGER DEFAULT 1,
      shuffle_questions BOOLEAN DEFAULT FALSE,
      shuffle_options BOOLEAN DEFAULT FALSE,
      show_answers BOOLEAN DEFAULT FALSE,
      status VARCHAR(50) DEFAULT 'draft',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log('6. Creating quiz_questions...');
    await pool.query(`CREATE TABLE IF NOT EXISTS quiz_questions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
      question TEXT NOT NULL,
      question_type VARCHAR(50) NOT NULL,
      image TEXT,
      marks DECIMAL(5, 2) NOT NULL DEFAULT 1.0,
      explanation TEXT,
      sort_order INTEGER DEFAULT 0
    )`);

    console.log('7. Creating quiz_options...');
    await pool.query(`CREATE TABLE IF NOT EXISTS quiz_options (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE,
      option_text TEXT NOT NULL,
      is_correct BOOLEAN DEFAULT FALSE
    )`);

    console.log('8. Creating quiz_attempts...');
    await pool.query(`CREATE TABLE IF NOT EXISTS quiz_attempts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
      student_id UUID REFERENCES students(id) ON DELETE CASCADE,
      score DECIMAL(5, 2) DEFAULT 0.0,
      total_marks DECIMAL(5, 2) NOT NULL,
      status VARCHAR(50) DEFAULT 'in_progress',
      started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      submitted_at TIMESTAMP WITH TIME ZONE
    )`);

    console.log('9. Creating certificates...');
    await pool.query(`CREATE TABLE IF NOT EXISTS certificates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      student_id UUID REFERENCES students(id) ON DELETE CASCADE,
      course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
      certificate_url TEXT NOT NULL,
      issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, course_id)
    )`);

    console.log('10. Creating notifications...');
    await pool.query(`CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      recipient_id UUID NOT NULL,
      read_status BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log('11. Creating audit_logs...');
    await pool.query(`CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      action VARCHAR(255) NOT NULL,
      module VARCHAR(255) NOT NULL,
      record_id UUID,
      ip_address VARCHAR(45),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log('12. Upgrading activity_logs foreign key constraint...');
    try {
      await pool.query(`ALTER TABLE activity_logs DROP CONSTRAINT IF EXISTS activity_logs_user_id_fkey`);
      await pool.query(`ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`);
    } catch (e) {
      console.warn("Failed to upgrade activity_logs constraint in migrations:", e);
    }

    console.log('SUCCESS: All missing tables created and foreign keys integrated!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

runMigration();
