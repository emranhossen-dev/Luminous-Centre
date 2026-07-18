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
    // Check for authentication (optional for guest users)
    const authHeader = request.headers.get('authorization');
    let userId = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // User is logged in, verify token
      const token = authHeader.substring(7);
      let decoded: any;
      
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        userId = decoded.userId || decoded.id;
      } catch (error) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      
      if (!userId) {
        return NextResponse.json({ error: 'Invalid user token' }, { status: 401 });
      }
    }
    // If no auth header, allow guest user (userId remains null)

    // Parse request body
    const body: CourseEnrollmentData & { paymentMethod?: string } = await request.json();
    
    // Validate required fields (paymentScreenshotUrl is optional)
    const requiredFields = [
      'courseId', 'fullName', 'mobileNumber', 'email', 
      'amount', 
      'courseTitle', 'courseCategory', 'coursePrice', 'batchName'
    ];

    for (const field of requiredFields) {
      if (!body[field as keyof CourseEnrollmentData]) {
        return NextResponse.json({ 
          error: `Missing required field: ${field}` 
        }, { status: 400 });
      }
    }

    const paymentMethod = body.paymentMethod || 'manual';

    // If not cash, transactionId is required
    if (paymentMethod !== 'cash' && !body.transactionId) {
      return NextResponse.json({ 
        error: 'Missing required field: transactionId' 
      }, { status: 400 });
    }

    // Set default value for optional paymentScreenshotUrl
    const paymentScreenshotUrl = body.paymentScreenshotUrl || null;

    // Check if user already has an active enrollment for this course
    let existingEnrollment;
    
    if (userId) {
      // Logged-in user: check by user_id
      existingEnrollment = await query(
        `SELECT id FROM course_enrollment_requests 
         WHERE user_id = $1 AND course_id = $2 
         AND enrollment_status IN ('applied', 'waiting', 'admitted')`,
        [userId, body.courseId]
      );
    } else {
      // Guest user: check by email or mobile number to prevent duplicates
      existingEnrollment = await query(
        `SELECT id FROM course_enrollment_requests 
         WHERE user_id IS NULL AND course_id = $1 
         AND (email = $2 OR mobile_number = $3)
         AND enrollment_status IN ('applied', 'waiting', 'admitted')`,
        [body.courseId, body.email, body.mobileNumber]
      );
    }

    if (existingEnrollment.rows.length > 0) {
      const errorMsg = userId 
        ? 'You are already enrolled in this course. Please check your dashboard for existing enrollments.'
        : 'An enrollment request with this email or mobile number already exists. Please use a different email or mobile number.';
      
      return NextResponse.json({ 
        error: errorMsg,
        details: {
          type: userId ? 'logged_in_duplicate' : 'guest_duplicate',
          existingEnrollmentId: existingEnrollment.rows[0].id
        }
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
        paymentMethod, // payment method
        'pending', // payment status
        'applied', // enrollment status
        body.amount,
        'BDT',
        paymentMethod === 'cash' ? (body.transactionId || 'CASH_' + Date.now()) : body.transactionId,
        paymentScreenshotUrl, // Use the optional field with default value
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
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}
