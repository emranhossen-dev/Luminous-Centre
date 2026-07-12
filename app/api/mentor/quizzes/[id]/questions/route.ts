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
    const body = await req.json();

    const questionsToInsert = Array.isArray(body) ? body : (body.questions && Array.isArray(body.questions) ? body.questions : [body]);

    // Validate all questions first
    for (const q of questionsToInsert) {
      if (!q.question || !q.options || !Array.isArray(q.options)) {
        return NextResponse.json({ error: 'Missing required question fields in one or more questions' }, { status: 400 });
      }
    }

    const result = await transaction(async (client) => {
      // 1. Delete existing questions (cascade deletes options automatically)
      await client.query('DELETE FROM quiz_questions WHERE quiz_id = $1', [id]);

      const insertedQuestions = [];

      for (let i = 0; i < questionsToInsert.length; i++) {
        const q = questionsToInsert[i];
        // 2. Insert question
        const questionQuery = `
          INSERT INTO quiz_questions (quiz_id, question, question_type, marks, explanation, sort_order)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id
        `;
        const qRes = await client.query(questionQuery, [
          id,
          q.question,
          q.questionType || 'mcq',
          parseFloat(q.marks) || 1.0,
          q.explanation || '',
          i
        ]);
        const questionId = qRes.rows[0].id;

        // 3. Insert options
        const insertedOptions = [];
        for (const opt of q.options) {
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

        insertedQuestions.push({ questionId, options: insertedOptions });
      }

      return insertedQuestions;
    });

    return NextResponse.json({
      success: true,
      message: `${questionsToInsert.length} question(s) synced successfully`,
      questions: result
    });
  } catch (error: any) {
    console.error('Sync quiz questions error:', error);
    return NextResponse.json({ error: 'Failed to sync questions', details: error.message }, { status: 500 });
  }
}
