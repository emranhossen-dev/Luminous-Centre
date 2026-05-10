import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST() {
  try {
    console.log('Starting enrollment table fix...');

    // Add missing columns
    const alterQueries = [
      `ALTER TABLE course_enrollment_requests 
       ADD COLUMN IF NOT EXISTS full_name VARCHAR(255)`,
      
      `ALTER TABLE course_enrollment_requests 
       ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(20)`,
       
      `ALTER TABLE course_enrollment_requests 
       ADD COLUMN IF NOT EXISTS email VARCHAR(255)`,
       
      `ALTER TABLE course_enrollment_requests 
       ADD COLUMN IF NOT EXISTS payment_screenshot_url VARCHAR(500)`,
       
      `ALTER TABLE course_enrollment_requests 
       ADD COLUMN IF NOT EXISTS course_title VARCHAR(255)`,
       
      `ALTER TABLE course_enrollment_requests 
       ADD COLUMN IF NOT EXISTS course_category VARCHAR(100)`,
       
      `ALTER TABLE course_enrollment_requests 
       ADD COLUMN IF NOT EXISTS course_price DECIMAL(10, 2)`,
       
      `ALTER TABLE course_enrollment_requests 
       ADD COLUMN IF NOT EXISTS batch_name VARCHAR(100)`
    ];

    for (const alterQuery of alterQueries) {
      try {
        await query(alterQuery);
        console.log('Executed:', alterQuery);
      } catch (error) {
        console.log('Note (column might already exist):', error.message);
      }
    }

    // Update existing records
    await query(`
      UPDATE course_enrollment_requests 
      SET 
          full_name = COALESCE(full_name, 'Unknown'),
          mobile_number = COALESCE(mobile_number, 'N/A'),
          email = COALESCE(email, 'N/A'),
          payment_screenshot_url = COALESCE(payment_screenshot_url, ''),
          course_title = COALESCE(course_title, 'Unknown Course'),
          course_category = COALESCE(course_category, 'General'),
          course_price = COALESCE(course_price, 0),
          batch_name = COALESCE(batch_name, 'Current Batch')
      WHERE full_name IS NULL OR mobile_number IS NULL OR email IS NULL
    `);

    // Verify the updated table structure
    const columnsResult = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'course_enrollment_requests' 
      ORDER BY ordinal_position
    `);

    return NextResponse.json({
      success: true,
      message: 'Enrollment table structure updated successfully',
      columns: columnsResult.rows
    });

  } catch (error) {
    console.error('Error fixing enrollment table:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
