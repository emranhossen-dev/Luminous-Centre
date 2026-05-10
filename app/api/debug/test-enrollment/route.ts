import { NextResponse } from 'next/server';
import { query } from '@/lib/database';
import jwt from 'jsonwebtoken';

export async function POST() {
  try {
    // Create a test token (in real scenario this comes from login)
    const testUserId = 1; // Assuming user with ID 1 exists
    const token = jwt.sign(
      { userId: testUserId, email: 'test@example.com' },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1h' }
    );

    // Test enrollment data
    const testEnrollmentData = {
      courseId: 1, // Assuming course with ID 1 exists
      fullName: 'Test User',
      mobileNumber: '01577296272',
      email: 'test@example.com',
      transactionId: 'TEST123456',
      paymentScreenshotUrl: 'https://i.ibb.co/test-screenshot.jpg',
      amount: 10000,
      courseTitle: 'Test Course',
      courseCategory: 'Programming',
      coursePrice: 10000,
      batchName: 'Test Batch'
    };

    // Simulate the API call
    const response = await fetch('http://localhost:3000/api/enhanced-enrollment/course', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testEnrollmentData)
    });

    const result = await response.json();

    // Also check if data was inserted
    const checkQuery = await query(`
      SELECT * FROM course_enrollment_requests 
      WHERE transaction_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `, [testEnrollmentData.transactionId]);

    return NextResponse.json({
      success: true,
      apiResponse: result,
      databaseRecord: checkQuery.rows[0] || null,
      testData: testEnrollmentData
    });

  } catch (error) {
    console.error('Test enrollment error:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
