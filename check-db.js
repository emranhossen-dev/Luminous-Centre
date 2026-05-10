const { query } = require('./lib/database.ts');

async function checkDatabase() {
  try {
    console.log('Checking course_enrollment_requests table structure...');
    
    // Check if table exists
    const tableExists = await query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'course_enrollment_requests'
      ) AS exists
    `);
    
    console.log('Table exists:', tableExists.rows[0]?.exists);
    
    if (tableExists.rows[0]?.exists) {
      // Get table columns
      const columns = await query(`
        SELECT column_name, data_type, is_nullable, character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = 'course_enrollment_requests' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `);
      
      console.log('Table columns:');
      columns.rows.forEach(col => {
        console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, max_length: ${col.character_maximum_length})`);
      });
      
      // Test a simple insert
      console.log('Testing simple insert...');
      const testInsert = await query(`
        INSERT INTO course_enrollment_requests (
          user_id, course_id, full_name, mobile_number, email,
          payment_method, payment_status, enrollment_status,
          amount, currency, transaction_id, payment_screenshot_url,
          course_title, course_category, course_price, batch_name
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id
      `, [
        null, // user_id
        1, // course_id
        'Test User', // full_name
        '01234567890', // mobile_number
        'test@example.com', // email
        'manual', // payment_method
        'pending', // payment_status
        'applied', // enrollment_status
        1000, // amount
        'BDT', // currency
        'TEST123', // transaction_id
        null, // payment_screenshot_url
        'Test Course', // course_title
        'Programming', // course_category
        1000, // course_price
        'Batch 1' // batch_name
      ]);
      
      console.log('Test insert result:', testInsert.rows[0]);
    }
    
  } catch (error) {
    console.error('Database check error:', error);
  }
}

checkDatabase();
