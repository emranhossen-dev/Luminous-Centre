import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Pool } = pg;

// Load .env variables
const envPath = path.resolve('.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const index = trimmed.indexOf('=');
    if (index === -1) return;
    const key = trimmed.slice(0, index).trim();
    let val = trimmed.slice(index + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  });
}

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '6543'),
  ssl: { rejectUnauthorized: false },
});

async function patch() {
  try {
    console.log('Altering course_enrollment_requests table...');
    await pool.query(`
      ALTER TABLE course_enrollment_requests 
      ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20)
    `);
    console.log('SUCCESS: whatsapp_number column added successfully!');
  } catch (err) {
    console.error('Failed to add column:', err);
  } finally {
    await pool.end();
  }
}

patch();
