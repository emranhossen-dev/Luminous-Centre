import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import jwt from 'jsonwebtoken';

interface CourseEnrollmentData {
  courseId: number;
  fullName: string;
  mobileNumber: string;
  email: string;
  transactionId: string;
  paymentScreenshotUrl: string;
  amount: number;
  courseTitle: string;
  courseCategory: string;
  coursePrice: number;
  batchName: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded: any;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId || decoded.id;
    if (!userId) {
      return NextResponse.json({ error: 'Invalid user token' }, { status: 401 });
    }

    // Parse request body
    const body: CourseEnrollmentData = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'courseId', 'fullName', 'mobileNumber', 'email', 
      'transactionId', 'paymentScreenshotUrl', 'amount', 
      'courseTitle', 'courseCategory', 'coursePrice', 'batchName'
    ];

    for (const field of requiredFields) {
      if (!body[field as keyof CourseEnrollmentData]) {
        return NextResponse.json({ 
          error: `Missing required field: ${field}` 
        }, { status: 400 });
      }
    }

    // Check if user already has an active enrollment for this course
    const existingEnrollment = await query(
      `SELECT id FROM course_enrollment_requests 
       WHERE user_id = $1 AND course_id = $2 
       AND enrollment_status IN ('applied', 'waiting', 'admitted')`,
      [userId, body.courseId]
    );

    if (existingEnrollment.rows.length > 0) {
      return NextResponse.json({ 
        error: 'You already have an active enrollment request for this course' 
      }, { status: 400 });
    }

    // Insert enrollment request
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
        'manual', // payment method
        'pending', // payment status
        'applied', // enrollment status
        body.amount,
        'BDT',
        body.transactionId,
        body.paymentScreenshotUrl,
        body.courseTitle,
        body.courseCategory,
        body.coursePrice,
        body.batchName
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Enrollment request submitted successfully',
      enrollmentId: result.rows[0].id
    });

  } catch (error) {
    console.error('Course enrollment error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
