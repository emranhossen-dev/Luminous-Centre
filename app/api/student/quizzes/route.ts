import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { query } from '@/lib/database';
import { detectEnrollmentUserColumn } from '@/lib/enrollment';

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

    // Get student active enrolled course ids
    const userColumn = await detectEnrollmentUserColumn();
    const enrollmentsResult = await query(
      `SELECT course_id FROM enrollments WHERE ${userColumn} = $1 AND status = 'active'`,
      [user.id]
    );
    
    if (enrollmentsResult.rows.length === 0) {
      return NextResponse.json({ quizzes: [] });
    }

    const courseIds = enrollmentsResult.rows.map(row => row.course_id);

    // Fetch student UUID mapping
    const studentRes = await query(`SELECT id FROM students WHERE email = $1`, [user.email.toLowerCase()]);
    const studentUuid = studentRes.rows[0]?.id || null;

    // Fetch published quizzes for those courses
    const quizzesRes = await query(
      `SELECT 
        q.id,
        q.title,
        q.description,
        q.duration,
        q.passing_score as "passingScore",
        c.title as "courseTitle",
        (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) as "questionsCount",
        qa.score as "attemptScore",
        qa.status as "attemptStatus"
       FROM quizzes q
       JOIN courses c ON q.course_id = c.id
       LEFT JOIN quiz_attempts qa ON qa.quiz_id = q.id AND qa.student_id = $2
       WHERE q.course_id = ANY($1)
       ORDER BY q.created_at DESC`,
      [courseIds, studentUuid]
    );

    return NextResponse.json({ quizzes: quizzesRes.rows });
  } catch (error: any) {
    console.error('Get student quizzes error:', error);
    return NextResponse.json({ error: 'Failed to fetch quizzes', details: error.message }, { status: 500 });
  }
}
