import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST() {
  try {
    // Create a real user token (assuming user ID 4 exists from earlier data)
    const userToken = jwt.sign(
      { userId: 4, email: 'dev.emranhossen@gmail.com' },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1h' }
    );

    // Real enrollment data
    const enrollmentData = {
      courseId: 39, // MERN Stack Development
      fullName: 'Emran Hossen',
      mobileNumber: '01577296272',
      email: 'dev.emranhossen@gmail.com',
      transactionId: 'BKASH' + Date.now(),
      paymentScreenshotUrl: 'https://i.ibb.co/example/payment-screenshot.jpg',
      amount: 10000,
      courseTitle: 'MERN Stack Development',
      courseCategory: 'Programming',
      coursePrice: 10000,
      batchName: 'Current Batch'
    };

    // Test the actual enrollment API
    const response = await fetch('http://localhost:3000/api/enhanced-enrollment/course', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify(enrollmentData)
    });

    const result = await response.json();

    // Also test admin API with admin token
    const adminToken = jwt.sign(
      { userId: 1, email: 'admin@luminous.com', role: 'admin' },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1h' }
    );

    const adminResponse = await fetch('http://localhost:3000/api/admin/enhanced-enrollments', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    const adminResult = await adminResponse.json();

    return NextResponse.json({
      success: true,
      enrollmentResult: result,
      adminResult: adminResult,
      testData: enrollmentData,
      userToken: userToken.substring(0, 20) + '...',
      adminToken: adminToken.substring(0, 20) + '...'
    });

  } catch (error) {
    console.error('Final enrollment test error:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
