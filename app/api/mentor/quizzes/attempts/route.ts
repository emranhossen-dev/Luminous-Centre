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

    const attemptsQuery = `
      SELECT 
        qa.id, qa.score, qa.total_marks, qa.status, qa.submitted_at,
        s.name as student_name, s.email as student_email,
        q.title as quiz_title, q.passing_score,
        c.title as course_title
      FROM quiz_attempts qa
      JOIN students s ON qa.student_id = s.id
      JOIN quizzes q ON qa.quiz_id = q.id
      JOIN courses c ON q.course_id = c.id
      WHERE q.mentor_id = $1
      ORDER BY qa.submitted_at DESC
    `;
    const result = await query(attemptsQuery, [mentorId]);

    const attempts = result.rows.map(att => {
      const score = parseFloat(att.score) || 0;
      const totalMarks = parseFloat(att.total_marks) || 1;
      const passingScore = parseFloat(att.passing_score) || 50;
      const scorePercentage = (score / totalMarks) * 100;
      
      return {
        id: att.id,
        score,
        totalMarks,
        status: att.status,
        submittedAt: att.submitted_at,
        studentName: att.student_name,
        studentEmail: att.student_email,
        quizTitle: att.quiz_title,
        courseTitle: att.course_title,
        passed: scorePercentage >= passingScore
      };
    });

    return NextResponse.json({ attempts });
  } catch (error: any) {
    console.error('Get quiz attempts error:', error);
    return NextResponse.json({ error: 'Failed to fetch attempts', details: error.message }, { status: 500 });
  }
}
