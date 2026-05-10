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
    console.log('=== ENROLLMENT DEBUG START ===');
    
    // Step 1: Verify authentication
    console.log('Step 1: Checking authentication...');
    const authHeader = request.headers.get('authorization');
    console.log('Auth header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('ERROR: No valid auth header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    console.log('Token:', token.substring(0, 20) + '...');
    
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      console.log('Token decoded successfully:', decoded);
    } catch (error) {
      console.log('ERROR: Token verification failed:', error.message);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId || decoded.id;
    console.log('User ID:', userId);
    
    if (!userId) {
      console.log('ERROR: No user ID in token');
      return NextResponse.json({ error: 'Invalid user token' }, { status: 401 });
    }

    // Step 2: Parse request body
    console.log('Step 2: Parsing request body...');
    const body: CourseEnrollmentData = await request.json();
    console.log('Request body:', body);
    
    // Step 3: Validate required fields
    console.log('Step 3: Validating required fields...');
    const requiredFields = [
      'courseId', 'fullName', 'mobileNumber', 'email', 
      'transactionId', 'paymentScreenshotUrl', 'amount', 
      'courseTitle', 'courseCategory', 'coursePrice', 'batchName'
    ];

    for (const field of requiredFields) {
      if (!body[field as keyof CourseEnrollmentData]) {
        console.log('ERROR: Missing field:', field);
        return NextResponse.json({ 
          error: `Missing required field: ${field}` 
        }, { status: 400 });
      }
    }
    console.log('All required fields present');

    // Step 4: Check existing enrollment
    console.log('Step 4: Checking existing enrollment...');
    try {
      const existingEnrollment = await query(
        `SELECT id FROM course_enrollment_requests 
         WHERE user_id = $1 AND course_id = $2 
         AND enrollment_status IN ('applied', 'waiting', 'admitted')`,
        [userId, body.courseId]
      );
      console.log('Existing enrollment check result:', existingEnrollment.rows);

      if (existingEnrollment.rows.length > 0) {
        console.log('ERROR: User already has active enrollment');
        return NextResponse.json({ 
          error: 'You already have an active enrollment request for this course' 
        }, { status: 400 });
      }
    } catch (error) {
      console.log('ERROR in existing enrollment check:', error.message);
      throw error;
    }

    // Step 5: Insert enrollment request
    console.log('Step 5: Inserting enrollment request...');
    try {
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
      console.log('Insert successful, result:', result.rows);

      return NextResponse.json({
        success: true,
        message: 'Enrollment request submitted successfully',
        enrollmentId: result.rows[0].id
      });
    } catch (error) {
      console.log('ERROR in insert operation:', error.message);
      throw error;
    }

  } catch (error) {
    console.error('=== ENROLLMENT DEBUG ERROR ===');
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}
