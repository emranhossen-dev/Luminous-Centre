import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import jwt from 'jsonwebtoken';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const enrollmentId = params.id;
    const body = await request.json();

    // Build dynamic update query
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    // Add fields to update based on request body
    if (body.enrollment_status !== undefined) {
      updateFields.push(`enrollment_status = $${paramIndex++}`);
      updateValues.push(body.enrollment_status);
    }

    if (body.payment_status !== undefined) {
      updateFields.push(`payment_status = $${paramIndex++}`);
      updateValues.push(body.payment_status);
    }

    if (body.admin_note !== undefined) {
      updateFields.push(`admin_note = $${paramIndex++}`);
      updateValues.push(body.admin_note);
    }

    // Always update reviewed_by and reviewed_at when making changes
    updateFields.push(`reviewed_by = $${paramIndex++}`);
    updateValues.push(decoded.userId || decoded.id);
    
    updateFields.push(`reviewed_at = $${paramIndex++}`);
    updateValues.push(new Date());

    // Add enrollment ID as the last parameter
    updateValues.push(enrollmentId);

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Execute update query
    const updateQuery = `
      UPDATE course_enrollment_requests 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Enrollment updated successfully',
      enrollment: result.rows[0]
    });

  } catch (error) {
    console.error('Update enrollment error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
