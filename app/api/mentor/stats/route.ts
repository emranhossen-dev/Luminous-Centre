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

    // Total Courses
    const coursesRes = await query('SELECT COUNT(*)::int as count FROM courses WHERE mentor_id = $1', [mentorId]);
    const totalCourses = coursesRes.rows[0].count;

    // Total Students (unique students enrolled in courses taught by this mentor)
    const studentsRes = await query(`
      SELECT COUNT(DISTINCT e.user_id)::int as count 
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE c.mentor_id = $1
    `, [mentorId]);
    const totalStudents = studentsRes.rows[0].count;

    // Total Quizzes
    const quizzesRes = await query('SELECT COUNT(*)::int as count FROM quizzes WHERE mentor_id = $1', [mentorId]);
    const totalQuizzes = quizzesRes.rows[0].count;

    // Total Attempts (attempts made on this mentor's quizzes)
    const attemptsRes = await query(`
      SELECT COUNT(qa.id)::int as count
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE q.mentor_id = $1
    `, [mentorId]);
    const totalAttempts = attemptsRes.rows[0].count;

    return NextResponse.json({
      totalStudents,
      totalCourses,
      totalQuizzes,
      totalAttempts
    });
  } catch (error: any) {
    console.error('Mentor stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats', details: error.message }, { status: 500 });
  }
}
