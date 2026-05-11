const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'postgres' : process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '6543'),
  ssl: process.env.DB_HOST?.includes('supabase.co') ? { rejectUnauthorized: false } : false,
});

async function checkAllEnrollments() {
  try {
    console.log('Checking ALL course_enrollment_requests...\n');
    
    // Get ALL enrollments without any filters
    const result = await pool.query(`
      SELECT 
        id,
        user_id,
        course_id,
        full_name,
        email,
        mobile_number,
        payment_method,
        payment_status,
        enrollment_status,
        amount,
        transaction_id,
        created_at
      FROM course_enrollment_requests 
      ORDER BY created_at DESC
    `);
    
    console.log(`Total enrollments found: ${result.rows.length}\n`);
    
    if (result.rows.length === 0) {
      console.log('No enrollments found in database!');
      return;
    }
    
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ID: ${row.id}`);
      console.log(`   User ID: ${row.user_id || 'NULL (Guest)'}`);
      console.log(`   Course ID: ${row.course_id}`);
      console.log(`   Name: ${row.full_name}`);
      console.log(`   Email: ${row.email}`);
      console.log(`   Mobile: ${row.mobile_number}`);
      console.log(`   Payment Method: ${row.payment_method}`);
      console.log(`   Payment Status: ${row.payment_status}`);
      console.log(`   Enrollment Status: ${row.enrollment_status}`);
      console.log(`   Amount: ${row.amount}`);
      console.log(`   Transaction ID: ${row.transaction_id}`);
      console.log(`   Created: ${row.created_at}`);
      console.log('---');
    });
    
    // Also check courses table to make sure course IDs exist
    console.log('\nChecking courses table...');
    const coursesResult = await pool.query('SELECT id, title FROM courses ORDER BY id');
    console.log('Available courses:');
    coursesResult.rows.forEach(course => {
      console.log(`  - ID: ${course.id}, Title: ${course.title}`);
    });
    
  } catch (error) {
    console.error('Error checking enrollments:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

checkAllEnrollments();
