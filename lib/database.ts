import { Pool } from 'pg';

// Database connection configuration for Supabase
const pool = new Pool({
  user: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'postgres' : process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 20, // Maximum number of connections
  idleTimeoutMillis: 30000, // Idle connections timeout
  connectionTimeoutMillis: 2000, // Connection timeout
  ssl: process.env.DB_HOST?.includes('supabase.co') ? { rejectUnauthorized: false } : false,
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

/** Returns true when `public.tableName` exists (avoids noisy errors from optional tables). */
export async function tableExists(tableName: string): Promise<boolean> {
  const res = await pool.query(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = $1
    ) AS exists`,
    [tableName]
  );
  return Boolean(res.rows[0]?.exists);
}

// Helper function to execute queries
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Transaction helper
export async function transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Database health check
export async function healthCheck() {
  try {
    const result = await query('SELECT NOW()');
    return {
      status: 'healthy',
      timestamp: result.rows[0].now,
      database: process.env.DB_NAME || 'luminous_dev'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

export default pool;
