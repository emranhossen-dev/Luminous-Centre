import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { query } from '@/lib/database';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
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

    const { id } = await context.params;

    // Fetch quiz details
    const quizRes = await query(
      `SELECT q.id, q.title, q.description, q.duration, q.passing_score as "passingScore", q.course_id as "courseId"
       FROM quizzes q
       WHERE q.id = $1 AND q.status = 'published'`,
      [id]
    );

    if (quizRes.rows.length === 0) {
      return NextResponse.json({ error: 'Quiz not found or not published' }, { status: 404 });
    }

    const quiz = quizRes.rows[0];

    // Fetch questions
    const questionsRes = await query(
      `SELECT id, question, question_type as "questionType", marks, explanation 
       FROM quiz_questions 
       WHERE quiz_id = $1 
       ORDER BY sort_order ASC`,
      [id]
    );

    const questions = [];
    for (const qRow of questionsRes.rows) {
      // Fetch options without is_correct field
      const optionsRes = await query(
        `SELECT id, option_text as "optionText" 
         FROM quiz_options 
         WHERE question_id = $1`,
        [qRow.id]
      );
      
      questions.push({
        id: qRow.id,
        question: qRow.question,
        questionType: qRow.questionType,
        marks: parseFloat(qRow.marks),
        options: optionsRes.rows
      });
    }

    return NextResponse.json({ quiz, questions });
  } catch (error: any) {
    console.error('Get student quiz error:', error);
    return NextResponse.json({ error: 'Failed to fetch quiz', details: error.message }, { status: 500 });
  }
}
