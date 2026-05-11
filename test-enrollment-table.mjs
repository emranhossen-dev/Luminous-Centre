import { query } from './lib/database.js';

async function testEnrollmentTable() {
  try {
    console.log('Testing course_enrollment_requests table...');
    
    // Test if table exists and has correct structure
    const result = await query('SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = \'course_enrollment_requests\' ORDER BY ordinal_position');
    
    console.log('Table columns:');
    result.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (${row.is_nullable})`);
    });
    
    console.log('\nTable structure looks good!');
    
    // Test inserting a guest enrollment
    console.log('\nTesting guest enrollment insertion...');
    const testInsert = await query(`
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
    
    console.log('Guest enrollment test successful! ID:', testInsert.rows[0].id);
    
    // Clean up test data
    await query('DELETE FROM course_enrollment_requests WHERE id = $1', [testInsert.rows[0].id]);
    console.log('Test data cleaned up');
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testEnrollmentTable();
