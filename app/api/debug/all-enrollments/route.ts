import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    // Get ALL enrollments without any filters
    const enrollmentsResult = await query(`
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

    return NextResponse.json({
      success: true,
      total: enrollmentsResult.rows.length,
      enrollments: enrollmentsResult.rows
    });

  } catch (error) {
    console.error('Fetch all enrollments error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}
