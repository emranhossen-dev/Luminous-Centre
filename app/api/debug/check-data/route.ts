import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    // Check users
    const usersResult = await query(`
      SELECT id, email, created_at FROM users 
      ORDER BY id 
      LIMIT 5
    `);

    // Check courses
    const coursesResult = await query(`
      SELECT id, title, slug, status, created_at FROM courses 
      ORDER BY id 
      LIMIT 5
    `);

    // Check foreign key constraints
    const constraintsResult = await query(`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'course_enrollment_requests'
    `);

    return NextResponse.json({
      users: usersResult.rows,
      courses: coursesResult.rows,
      foreignKeyConstraints: constraintsResult.rows
    });

  } catch (error) {
    console.error('Check data error:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
