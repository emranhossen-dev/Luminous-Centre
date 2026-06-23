import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { query } from '@/lib/database';

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/-+$/, '');
}

// GET /api/mentor/quizzes - Get quizzes created by mentor
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

    const quizzesQuery = `
      SELECT 
        q.id, q.title, q.slug, q.description, q.duration, q.passing_score, q.status, q.course_id,
        c.title as course_title,
        COUNT(qq.id)::int as questions_count
      FROM quizzes q
      JOIN courses c ON q.course_id = c.id
      LEFT JOIN quiz_questions qq ON q.id = qq.quiz_id
      WHERE q.mentor_id = $1
      GROUP BY q.id, c.title, q.created_at
      ORDER BY q.created_at DESC
    `;
    const result = await query(quizzesQuery, [mentorId]);

    const quizzes = result.rows.map(quiz => ({
      id: quiz.id,
      title: quiz.title,
      slug: quiz.slug,
      description: quiz.description,
      courseId: quiz.course_id,
      courseTitle: quiz.course_title,
      duration: quiz.duration,
      passingScore: quiz.passing_score,
      status: quiz.status,
      questionsCount: quiz.questions_count
    }));

    return NextResponse.json({ quizzes });
  } catch (error: any) {
    console.error('Get mentor quizzes error:', error);
    return NextResponse.json({ error: 'Failed to fetch quizzes', details: error.message }, { status: 500 });
  }
}

// POST /api/mentor/quizzes - Create a new quiz
export async function POST(req: NextRequest) {
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

    const { title, description, courseId, duration, passingScore } = await req.json();

    if (!title || !courseId || !duration || !passingScore) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const slug = `${generateSlug(title)}-${Date.now()}`;

    const insertQuery = `
      INSERT INTO quizzes (
        title, slug, description, course_id, mentor_id, duration, passing_score, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const result = await query(insertQuery, [
      title,
      slug,
      description || '',
      courseId,
      mentorId,
      parseInt(duration) || 30,
      parseFloat(passingScore) || 50.0,
      'published'
    ]);

    return NextResponse.json({
      success: true,
      message: 'Quiz created successfully',
      quiz: result.rows[0]
    });
  } catch (error: any) {
    console.error('Create quiz error:', error);
    return NextResponse.json({ error: 'Failed to create quiz', details: error.message }, { status: 500 });
  }
}
