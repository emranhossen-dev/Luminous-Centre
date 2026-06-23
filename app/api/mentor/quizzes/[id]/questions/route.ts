import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { query, transaction } from '@/lib/database';

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

    // Fetch questions
    const questionsRes = await query(
      'SELECT * FROM quiz_questions WHERE quiz_id = $1 ORDER BY sort_order ASC',
      [id]
    );

    const questions = [];

    for (const qRow of questionsRes.rows) {
      // Fetch options for each question
      const optionsRes = await query(
        'SELECT * FROM quiz_options WHERE question_id = $1',
        [qRow.id]
      );
      
      questions.push({
        id: qRow.id,
        question: qRow.question,
        questionType: qRow.question_type,
        marks: parseFloat(qRow.marks),
        explanation: qRow.explanation,
        options: optionsRes.rows.map(o => ({
          id: o.id,
          optionText: o.option_text,
          isCorrect: o.is_correct
        }))
      });
    }

    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error('Get quiz questions error:', error);
    return NextResponse.json({ error: 'Failed to fetch questions', details: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
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
    const { question, questionType, marks, explanation, options } = await req.json();

    if (!question || !questionType || !options || !Array.isArray(options)) {
      return NextResponse.json({ error: 'Missing required question fields' }, { status: 400 });
    }

    const result = await transaction(async (client) => {
      // 1. Insert question
      const questionQuery = `
        INSERT INTO quiz_questions (quiz_id, question, question_type, marks, explanation)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `;
      const qRes = await client.query(questionQuery, [
        id,
        question,
        questionType,
        parseFloat(marks) || 1.0,
        explanation || ''
      ]);
      const questionId = qRes.rows[0].id;

      // 2. Insert options
      const insertedOptions = [];
      for (const opt of options) {
        const optionQuery = `
          INSERT INTO quiz_options (question_id, option_text, is_correct)
          VALUES ($1, $2, $3)
          RETURNING *
        `;
        const oRes = await client.query(optionQuery, [
          questionId,
          opt.optionText,
          Boolean(opt.isCorrect)
        ]);
        insertedOptions.push(oRes.rows[0]);
      }

      return { questionId, insertedOptions };
    });

    return NextResponse.json({
      success: true,
      message: 'Question added successfully',
      questionId: result.questionId,
      options: result.insertedOptions
    });
  } catch (error: any) {
    console.error('Create quiz question error:', error);
    return NextResponse.json({ error: 'Failed to add question', details: error.message }, { status: 500 });
  }
}
