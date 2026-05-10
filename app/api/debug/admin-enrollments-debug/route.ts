import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    console.log('=== ADMIN ENROLLMENTS DEBUG START ===');
    
    // Step 1: Verify admin authentication
    console.log('Step 1: Checking admin authentication...');
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

    // Step 2: Check if user is admin
    console.log('Step 2: Checking admin role...');
    try {
      const adminCheck = await query(
        'SELECT id, role, email FROM users WHERE id = $1',
        [decoded.userId || decoded.id]
      );
      console.log('Admin check result:', adminCheck.rows);

      if (adminCheck.rows.length === 0) {
        console.log('ERROR: User not found');
        return NextResponse.json({ error: 'User not found' }, { status: 403 });
      }

      const userRole = adminCheck.rows[0].role;
      console.log('User role:', userRole);

      if (userRole !== 'admin') {
        console.log('ERROR: Not admin role');
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    } catch (error) {
      console.log('ERROR in admin check:', error.message);
      throw error;
    }

    // Step 3: Fetch enrollments
    console.log('Step 3: Fetching enrollments...');
    try {
      const enrollmentsResult = await query(`
        SELECT 
          cer.*,
          u.email as user_email,
          u.name as user_name
        FROM course_enrollment_requests cer
        LEFT JOIN users u ON cer.user_id = u.id
        ORDER BY cer.created_at DESC
      `);
      console.log('Enrollments query result:', enrollmentsResult.rows.length, 'rows');

      return NextResponse.json({
        success: true,
        enrollments: enrollmentsResult.rows
      });
    } catch (error) {
      console.log('ERROR in enrollments query:', error.message);
      throw error;
    }

  } catch (error) {
    console.error('=== ADMIN ENROLLMENTS DEBUG ERROR ===');
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}
