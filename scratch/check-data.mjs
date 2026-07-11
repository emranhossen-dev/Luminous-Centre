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

async function check() {
  try {
    const usersCols = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
    console.log('--- Users Columns ---');
    console.log(usersCols.rows.map(r => r.column_name));

    // Get a sample user to see values
    const users = await pool.query('SELECT id, email, is_active FROM users LIMIT 5');
    console.log('--- Sample Users ---');
    console.log(users.rows);

    process.exit(0);
  } catch (error) {
    console.error('Check error:', error);
    process.exit(1);
  }
}

check();
