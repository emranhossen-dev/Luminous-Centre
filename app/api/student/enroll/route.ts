import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { query } from '@/lib/database';
import { logActivity } from '@/lib/auth';
import { detectEnrollmentUserColumn } from '@/lib/enrollment';

// POST /api/student/enroll - Enroll student in course
export async function POST(req: NextRequest, context: { params: Promise<{}> }) {
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
    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    const userColumn = await detectEnrollmentUserColumn();

    // Check if already enrolled
    const existingEnrollment = await query(
      `SELECT id FROM enrollments WHERE ${userColumn} = $1 AND course_id = $2`,
      [user.id, courseId]
    );

    if (existingEnrollment.rows.length > 0) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 409 }
      );
    }

    // Create enrollment
    const result = await query(
      `INSERT INTO enrollments (${userColumn}, course_id, enrollment_date, status, completion_percentage)
       VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4) RETURNING id`,
      [user.id, courseId, 'active', 0]
    );

    // Log activity
    await logActivity(
      user.id,
      'enrollments.create',
      'course',
      courseId,
      { courseId }
    );

    return NextResponse.json({
      message: 'Successfully enrolled in course',
      enrollmentId: result.rows[0].id
    });

  } catch (error) {
    console.error('Enroll course error:', error);
    return NextResponse.json(
      { error: 'Failed to enroll in course' },
      { status: 500 }
    );
  }
}

// GET /api/student/enroll - Get student enrollments
export async function GET(req: NextRequest, context: { params: Promise<{}> }) {
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const offset = (page - 1) * limit;

    const userColumn = await detectEnrollmentUserColumn();
    const enrollmentsQuery = `
      SELECT 
        e.*,
        c.title as course_title,
        c.slug as course_slug,
        c.thumbnail_url,
        c.category,
        c.price,
        e.enrollment_date,
        e.status as enrollment_status
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.${userColumn} = $1
      ORDER BY e.enrollment_date DESC
      LIMIT $2 OFFSET $3
    `;

    const enrollmentsResult = await query(enrollmentsQuery, [user.id, limit, offset]);

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM enrollments WHERE ${userColumn} = $1`,
      [user.id]
    );
    const total = parseInt(countResult.rows[0].total);

    return NextResponse.json({
      enrollments: enrollmentsResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get enrollments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 }
    );
  }
}
