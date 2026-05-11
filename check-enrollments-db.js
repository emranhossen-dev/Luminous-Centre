const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'postgres' : process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '6543'),
  ssl: process.env.DB_HOST?.includes('supabase.co') ? { rejectUnauthorized: false } : false,
});

async function checkEnrollments() {
  try {
    console.log('Checking course_enrollment_requests table...\n');
    
    // Get all enrollments
    const result = await pool.query(`
      SELECT 
        id,
        user_id,
        course_id,
        full_name,
        email,
        mobile_number,
        enrollment_status,
        payment_status,
        created_at
      FROM course_enrollment_requests 
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    console.log('Recent enrollments:');
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ID: ${row.id}`);
      console.log(`   User ID: ${row.user_id || 'NULL (Guest)'}`);
      console.log(`   Course ID: ${row.course_id}`);
      console.log(`   Name: ${row.full_name}`);
      console.log(`   Email: ${row.email}`);
      console.log(`   Mobile: ${row.mobile_number}`);
      console.log(`   Status: ${row.enrollment_status}`);
      console.log(`   Payment: ${row.payment_status}`);
      console.log(`   Created: ${row.created_at}`);
      console.log('---');
    });
    
    // Check duplicate detection logic
    console.log('\nChecking duplicate detection for course 39...');
    const duplicateCheck = await pool.query(`
      SELECT id, user_id, email, mobile_number, enrollment_status
      FROM course_enrollment_requests 
      WHERE (user_id = $1 OR user_id IS NULL) AND course_id = $2 
      AND enrollment_status IN ('applied', 'waiting', 'admitted')
    `, [null, 39]);
    
    console.log(`Found ${duplicateCheck.rows.length} active enrollments for course 39 (guest users):`);
    duplicateCheck.rows.forEach(row => {
      console.log(`  - ID: ${row.id}, Email: ${row.email}, Mobile: ${row.mobile_number}, Status: ${row.enrollment_status}`);
    });
    
  } catch (error) {
    console.error('Error checking enrollments:', error.message);
  } finally {
    await pool.end();
  }
}

checkEnrollments();
