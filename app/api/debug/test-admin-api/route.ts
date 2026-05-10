import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET() {
  try {
    // Create admin token (assuming admin user ID 1)
    const adminToken = jwt.sign(
      { userId: 1, email: 'admin@luminous.com', role: 'admin' },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1h' }
    );

    // Test admin API
    const response = await fetch('http://localhost:3000/api/admin/enhanced-enrollments', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    return NextResponse.json({
      success: true,
      adminApiResponse: result,
      token: adminToken.substring(0, 20) + '...'
    });

  } catch (error) {
    console.error('Test admin API error:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
