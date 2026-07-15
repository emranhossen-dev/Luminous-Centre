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

async function run() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM roles');
    console.log('Roles list:');
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
