import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    // Check the most recent enrollment
    const recentEnrollments = await query(`
      SELECT 
        id, user_id, course_id, full_name, mobile_number, email,
        payment_method, payment_status, enrollment_status,
        amount, currency, transaction_id, payment_screenshot_url,
        course_title, course_category, course_price, batch_name,
        created_at, updated_at
      FROM course_enrollment_requests 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    // Check specific enrollment with ID 10 (our test)
    const specificEnrollment = await query(`
      SELECT 
        id, user_id, course_id, full_name, mobile_number, email,
        payment_method, payment_status, enrollment_status,
        amount, currency, transaction_id, payment_screenshot_url,
        course_title, course_category, course_price, batch_name,
        created_at, updated_at
      FROM course_enrollment_requests 
      WHERE id = 10
    `);

    return NextResponse.json({
      recentEnrollments: recentEnrollments.rows,
      specificEnrollment: specificEnrollment.rows[0] || null,
      totalEnrollments: recentEnrollments.rows.length
    });

  } catch (error) {
    console.error('Check enrollment data error:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
