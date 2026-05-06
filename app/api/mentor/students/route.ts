import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { query } from '@/lib/database';

// GET /api/mentor/students - Get students for mentor's courses
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
}
