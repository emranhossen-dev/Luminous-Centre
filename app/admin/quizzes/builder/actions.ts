'use server';

import pool from '@/lib/database';
import { revalidatePath } from 'next/cache';

export async function createQuiz(data: any) {
  try {
    // Basic validation
    if (!data.title || !data.slug) {
      return { success: false, error: 'Title and Slug are required' };
    }

    // Begin transaction
    await pool.query('BEGIN');

    // 1. Insert Quiz
    const quizResult = await pool.query(
      `INSERT INTO quizzes (
        title, slug, description, duration, passing_score, 
        attempt_limit, shuffle_questions, shuffle_options, show_answers, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [
        data.title, 
        data.slug, 
        data.description, 
        data.duration, 
        data.passing_score,
        data.attempt_limit,
        data.shuffle_questions,
        data.shuffle_options,
        data.show_answers,
        data.status
      ]
    );

    const quizId = quizResult.rows[0].id;

    // 2. Insert Questions and Options
    for (const question of data.questions) {
      if (!question.question) continue;

      const questionResult = await pool.query(
        `INSERT INTO quiz_questions (quiz_id, question, question_type, marks)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [quizId, question.question, question.question_type || 'mcq', question.marks || 1]
      );
      
      const questionId = questionResult.rows[0].id;

      // Options
      if (question.options && question.options.length > 0) {
        for (const option of question.options) {
          if (!option.text) continue;
          await pool.query(
            `INSERT INTO quiz_options (question_id, option_text, is_correct)
             VALUES ($1, $2, $3)`,
            [questionId, option.text, option.is_correct || false]
          );
        }
      }
    }

    // Commit transaction
    await pool.query('COMMIT');

    revalidatePath('/admin/quizzes');
    
    return { success: true, quizId };
  } catch (error: any) {
    await pool.query('ROLLBACK');
    console.error('Failed to create quiz:', error);
    
    // Check for unique slug violation
    if (error.code === '23505' && error.constraint === 'quizzes_slug_key') {
       return { success: false, error: 'A quiz with this slug already exists.' };
    }
    
    return { success: false, error: error.message || 'Database error occurred' };
  }
}
