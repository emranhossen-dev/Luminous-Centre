import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting guest enrollment test...');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const userId = null; // Guest user
    const paymentScreenshotUrl = body.paymentScreenshotUrl || null;
    
    console.log('Attempting to insert enrollment...');
    
    // Test the exact same query that's failing
    const result = await query(
      `INSERT INTO course_enrollment_requests (
        user_id, course_id, full_name, mobile_number, email,
        payment_method, payment_status, enrollment_status,
        amount, currency, transaction_id, payment_screenshot_url,
        course_title, course_category, course_price, batch_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING id`,
      [
        userId,
        body.courseId,
        body.fullName,
        body.mobileNumber,
        body.email,
        'manual',
        'pending',
        'applied',
        body.amount,
        'BDT',
        body.transactionId,
        paymentScreenshotUrl,
        body.courseTitle,
        body.courseCategory,
        body.coursePrice,
        body.batchName
      ]
    );
    
    console.log('Insert successful, ID:', result.rows[0].id);
    
    return NextResponse.json({
      success: true,
      message: 'Guest enrollment test successful',
      enrollmentId: result.rows[0].id
    });
    
  } catch (error) {
    console.error('Guest enrollment test error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      severity: error.severity,
      detail: error.detail,
      hint: error.hint
    });
    
    return NextResponse.json({ 
      error: 'Test failed',
      details: error.message,
      stack: error.stack,
      code: error.code,
      severity: error.severity,
      detail: error.detail,
      hint: error.hint
    }, { status: 500 });
  }
}
