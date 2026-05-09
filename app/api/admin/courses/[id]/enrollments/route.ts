import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { query } from '@/lib/database';
import { logActivity } from '@/lib/auth';

// GET /api/admin/courses/[id]/enrollments - Get enrollments for a course
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    // Authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    const user = await getUserById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const { id } = await context.params;

    // Get enrollments with user details
    const enrollments = await query(`
      SELECT 
        e.id,
        e.user_id,
        u.first_name,
        u.last_name,
        u.email,
        e.created_at,
        e.status
      FROM enrollments e
      JOIN users u ON e.user_id = u.id
      WHERE e.course_id = $1
      ORDER BY e.created_at DESC
    `, [id]);

    return NextResponse.json({
      enrollments: enrollments.rows,
      count: enrollments.rows.length
    });

  } catch (error) {
    console.error('Get enrollments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/courses/[id]/enrollments - Remove all enrollments for a course
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    // Authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    const user = await getUserById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const { id } = await context.params;

    // Get course details for logging
    const course = await query(
      'SELECT title FROM courses WHERE id = $1',
      [id]
    );

    if (course.rows.length === 0) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Delete all enrollments for this course
    const result = await query(
      'DELETE FROM enrollments WHERE course_id = $1 RETURNING id',
      [id]
    );

    // Log activity
    await logActivity(
      user.id,
      'courses.enrollments.delete',
      'course',
      parseInt(id),
      { 
        courseTitle: course.rows[0].title,
        deletedEnrollments: result.rows.length
      }
    );

    return NextResponse.json({
      message: `Successfully removed ${result.rows.length} enrollments`,
      deletedCount: result.rows.length
    });

  } catch (error) {
    console.error('Delete enrollments error:', error);
    return NextResponse.json(
      { error: 'Failed to remove enrollments' },
      { status: 500 }
    );
  }
}
