// Simple test to check database connection and table structure
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'postgres' : process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '6543'),
  ssl: process.env.DB_HOST?.includes('supabase.co') ? { rejectUnauthorized: false } : false,
});

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test connection
    const timeResult = await pool.query('SELECT NOW()');
    console.log('Database connected:', timeResult.rows[0].now);
    
    // Check table structure
    console.log('\nChecking course_enrollment_requests table structure...');
    const columnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'course_enrollment_requests' 
      ORDER BY ordinal_position
    `);
    
    console.log('Table columns:');
    columnsResult.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (${row.is_nullable}) ${row.column_default ? `[DEFAULT: ${row.column_default}]` : ''}`);
    });
    
    // Test the exact insert that's failing
    console.log('\nTesting guest enrollment insert...');
    const testInsert = await pool.query(`
      INSERT INTO course_enrollment_requests (
        user_id, course_id, full_name, mobile_number, email,
        payment_method, payment_status, enrollment_status,
        amount, currency, transaction_id, payment_screenshot_url,
        course_title, course_category, course_price, batch_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING id`,
      [
        null, // user_id for guest
        1, // course_id
        'Test User',
        '01234567890',
        'test@example.com',
        'manual',
        'pending',
        'applied',
        1000,
        'BDT',
        'TEST123',
        null,
        'Test Course',
        'Test Category',
        1000,
        'Test Batch'
      ]
    );
    
    console.log('Insert successful! ID:', testInsert.rows[0].id);
    
    // Clean up
    await pool.query('DELETE FROM course_enrollment_requests WHERE id = $1', [testInsert.rows[0].id]);
    console.log('Test data cleaned up');
    
  } catch (error) {
    console.error('Database test error:', error.message);
    console.error('Error details:', {
      code: error.code,
      severity: error.severity,
      detail: error.detail,
      hint: error.hint,
      where: error.where
    });
  } finally {
    await pool.end();
  }
}

testDatabase();
