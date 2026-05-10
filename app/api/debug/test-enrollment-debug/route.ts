import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST() {
  try {
    // Create a test token
    const testUserId = 1;
    const token = jwt.sign(
      { userId: testUserId, email: 'test@example.com' },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1h' }
    );

    // Test enrollment data
    const testEnrollmentData = {
      courseId: 39, // Use valid course ID
      fullName: 'Test User',
      mobileNumber: '01577296272',
      email: 'test@example.com',
      transactionId: 'TEST123456',
      paymentScreenshotUrl: 'https://i.ibb.co/test-screenshot.jpg',
      amount: 10000,
      courseTitle: 'MERN Stack Development',
      courseCategory: 'Programming',
      coursePrice: 10000,
      batchName: 'Current Batch'
    };

    // Call debug API
    const response = await fetch('http://localhost:3000/api/debug/enrollment-debug', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testEnrollmentData)
    });

    const result = await response.json();

    return NextResponse.json({
      success: true,
      debugResponse: result,
      testData: testEnrollmentData,
      token: token.substring(0, 20) + '...'
    });

  } catch (error) {
    console.error('Test enrollment debug error:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
