import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
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

    // Check if user is admin
    const adminCheck = await query(
      'SELECT role FROM users WHERE id = $1',
      [decoded.userId || decoded.id]
    );

    if (adminCheck.rows.length === 0 || adminCheck.rows[0].role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch enrollments with user information
    const enrollmentsResult = await query(`
      SELECT 
        cer.*,
        u.email as user_email,
        u.name as user_name
      FROM course_enrollment_requests cer
      LEFT JOIN users u ON cer.user_id = u.id
      ORDER BY cer.created_at DESC
    `);

    return NextResponse.json({
      success: true,
      enrollments: enrollmentsResult.rows
    });

  } catch (error) {
    console.error('Fetch enrollments error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
