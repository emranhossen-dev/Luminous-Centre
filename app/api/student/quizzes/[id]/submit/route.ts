import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { query, transaction } from '@/lib/database';

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
    const { answers } = await req.json(); // Object mapping questionId -> selectedOptionId

    if (!answers) {
      return NextResponse.json({ error: 'Answers payload is required' }, { status: 400 });
    }

    // Get student record
    const studentRes = await query(`SELECT id FROM students WHERE email = $1`, [user.email.toLowerCase()]);
    if (studentRes.rows.length === 0) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }
    const studentId = studentRes.rows[0].id;

    // Fetch quiz metadata
    const quizRes = await query(
      `SELECT id, passing_score as "passingScore" FROM quizzes WHERE id = $1 AND status = 'published'`,
      [id]
    );

    if (quizRes.rows.length === 0) {
      return NextResponse.json({ error: 'Quiz not found or not published' }, { status: 404 });
    }

    const quiz = quizRes.rows[0];

    // Fetch quiz questions to evaluate correct answers
    const questionsRes = await query(
      `SELECT id, marks, question_type as "questionType" FROM quiz_questions WHERE quiz_id = $1`,
      [id]
    );

    let totalMarks = 0;
    let score = 0;

    await transaction(async (client) => {
      // Evaluate each question
      for (const q of questionsRes.rows) {
        const questionId = q.id;
        const marks = parseFloat(q.marks);
        totalMarks += marks;

        // Fetch correct option(s) for this question
        const optionsRes = await client.query(
          `SELECT id FROM quiz_options WHERE question_id = $1 AND is_correct = TRUE`,
          [questionId]
        );
        const correctOptionIds = optionsRes.rows.map(o => o.id);

        const submittedOption = answers[questionId];

        if (q.questionType === 'multiple_select') {
          const submittedArray = Array.isArray(submittedOption) ? submittedOption : [submittedOption];
          const isCorrect = 
            correctOptionIds.length === submittedArray.length &&
            correctOptionIds.every(id => submittedArray.includes(id));
          if (isCorrect) {
            score += marks;
          }
        } else {
          // Single select or true/false
          if (correctOptionIds.includes(submittedOption)) {
            score += marks;
          }
        }
      }

      // Check if attempt exists for student & quiz
      const checkAttemptRes = await client.query(
        `SELECT id FROM quiz_attempts WHERE quiz_id = $1 AND student_id = $2`,
        [id, studentId]
      );

      if (checkAttemptRes.rows.length > 0) {
        // Update existing attempt
        await client.query(
          `UPDATE quiz_attempts 
           SET score = $1, total_marks = $2, status = 'completed', submitted_at = CURRENT_TIMESTAMP 
           WHERE id = $3`,
          [score, totalMarks, checkAttemptRes.rows[0].id]
        );
      } else {
        // Insert new attempt
        await client.query(
          `INSERT INTO quiz_attempts (quiz_id, student_id, score, total_marks, status, submitted_at)
           VALUES ($1, $2, $3, $4, 'completed', CURRENT_TIMESTAMP)`,
          [id, studentId, score, totalMarks]
        );
      }
    });

    const passed = score >= parseFloat(quiz.passingScore);

    return NextResponse.json({
      success: true,
      score,
      totalMarks,
      passed
    });
  } catch (error: any) {
    console.error('Submit quiz attempt error:', error);
    return NextResponse.json({ error: 'Failed to submit quiz attempt', details: error.message }, { status: 500 });
  }
}
