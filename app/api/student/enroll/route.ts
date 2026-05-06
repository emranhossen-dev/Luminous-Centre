import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { query } from '@/lib/database';
import { logActivity } from '@/lib/auth';

// POST /api/student/enroll - Enroll student in course
const enrollInCourse = withAuth(async (req: NextRequest, context: any, user: any) => {
  try {
    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const existingEnrollment = await query(
      'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
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
      'INSERT INTO enrollments (user_id, course_id, enrollment_date, status, completion_percentage) VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4) RETURNING id',
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
    console.error('Enrollment error:', error);
    return NextResponse.json(
      { error: 'Failed to enroll in course' },
      { status: 500 }
    );
  }
});

// GET /api/student/enrollments - Get student's enrollments
const getStudentEnrollments = withAuth(async (req: NextRequest, context: any, user: any) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const offset = (page - 1) * limit;

    const enrollmentsQuery = `
      SELECT 
        e.id,
        e.enrollment_date,
        e.completion_percentage,
        e.status,
        c.title as course_title,
        c.thumbnail_url
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.user_id = $1
      ORDER BY e.enrollment_date DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(enrollmentsQuery, [user.id, limit, offset]);

    const enrollments = result.rows.map(enrollment => ({
      id: enrollment.id,
      enrolledAt: enrollment.enrollment_date,
      progress: enrollment.completion_percentage,
      status: enrollment.status,
      courseTitle: enrollment.course_title,
      thumbnailUrl: enrollment.thumbnail_url
    }));

    return NextResponse.json({
      enrollments
    });

  } catch (error) {
    console.error('Get enrollments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 }
    );
  }
});

export const POST = enrollInCourse;
export const GET = getStudentEnrollments;
