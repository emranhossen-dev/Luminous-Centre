import pg from 'pg';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Parse .env manually
const envPath = resolve(process.cwd(), '.env');
const envContent = readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const pool = new pg.Pool({
  user: envVars.DB_USER || 'postgres',
  host: envVars.DB_HOST || 'localhost',
  database: envVars.DB_NAME || 'postgres',
  password: envVars.DB_PASSWORD || '',
  port: parseInt(envVars.DB_PORT || '6543'),
  ssl: envVars.DB_HOST?.includes('supabase') ? { rejectUnauthorized: false } : false,
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS student_video_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        lesson_video_id INTEGER REFERENCES lesson_videos(id) ON DELETE CASCADE,
        watched_seconds INTEGER DEFAULT 0,
        total_seconds INTEGER DEFAULT 0,
        completed BOOLEAN DEFAULT FALSE,
        last_watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, lesson_video_id)
      )
    `);
    console.log('✅ student_video_progress table created');

    await client.query(`
      CREATE TABLE IF NOT EXISTS student_lesson_notes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        lesson_video_id INTEGER REFERENCES lesson_videos(id) ON DELETE CASCADE,
        content TEXT DEFAULT '',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, lesson_video_id)
      )
    `);
    console.log('✅ student_lesson_notes table created');

    await client.query(`
      CREATE TABLE IF NOT EXISTS lesson_resources (
        id SERIAL PRIMARY KEY,
        lesson_video_id INTEGER REFERENCES lesson_videos(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        url TEXT,
        file_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ lesson_resources table created');

    await client.query(`
      CREATE TABLE IF NOT EXISTS lesson_tasks (
        id SERIAL PRIMARY KEY,
        lesson_video_id INTEGER REFERENCES lesson_videos(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        due_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ lesson_tasks table created');

    console.log('\n🎉 All migration tables created successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
