import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { query } from '@/lib/database';

// GET /api/mentor/students - Get students for mentor's courses
const getMentorStudents = withAuth(async (req: NextRequest, context: any, user: any) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const courseId = searchParams.get('courseId');

    let whereClause = 'WHERE 1=1';
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (s.first_name ILIKE $${paramIndex++} OR s.last_name ILIKE $${paramIndex++} OR s.email ILIKE $${paramIndex++})`;
      queryParams.push(search, search, search);
    }

    if (courseId) {
      whereClause += ` AND e.course_id = $${paramIndex++}`;
      queryParams.push(courseId);
    }

    const offset = (page - 1) * limit;

    const studentsQuery = `
      SELECT 
        s.id,
        s.first_name,
        s.last_name,
        s.email,
        s.phone,
        e.enrolled_at,
        e.progress_percentage,
        c.title as course_title
      FROM enrollments e
      JOIN users s ON e.user_id = s.id
      JOIN courses c ON e.course_id = c.id
      ${whereClause}
      ORDER BY e.enrolled_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const studentsResult = await query(studentsQuery, queryParams);

    const students = studentsResult.rows.map(student => ({
      id: student.id,
      firstName: student.first_name,
      lastName: student.last_name,
      email: student.email,
      phone: student.phone,
      enrolledAt: student.enrolled_at,
      progress: student.progress_percentage,
      courseTitle: student.course_title
    }));

    return NextResponse.json({
      students
    });

  } catch (error) {
    console.error('Get mentor students error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
});

export const GET = getMentorStudents;
