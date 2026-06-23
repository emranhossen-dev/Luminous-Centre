import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { query } from '@/lib/database';

export async function GET(req: NextRequest) {
  try {
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

    const mentorRes = await query('SELECT id FROM mentors WHERE email = $1', [user.email]);
    if (mentorRes.rows.length === 0) {
      return NextResponse.json({ error: 'Mentor profile not found' }, { status: 404 });
    }
    const mentorId = mentorRes.rows[0].id;

    const coursesQuery = `
      SELECT 
        c.id, c.title, c.slug, c.category, c.status, c.price, c.thumbnail_url,
        COUNT(e.id)::int as enrolled_students
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      WHERE c.mentor_id = $1
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `;
    const result = await query(coursesQuery, [mentorId]);

    const courses = result.rows.map(course => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      category: course.category,
      status: course.status,
      price: course.price,
      thumbnailUrl: course.thumbnail_url,
      enrolledStudents: course.enrolled_students
    }));

    return NextResponse.json({ courses });
  } catch (error: any) {
    console.error('Get mentor courses error:', error);
    return NextResponse.json({ error: 'Failed to fetch courses', details: error.message }, { status: 500 });
  }
}
