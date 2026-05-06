import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    // Test basic database connection
    const timeResult = await query('SELECT NOW() as current_time');
    console.log('Database connected:', timeResult.rows[0]);

    // Get all courses without any filters
    const allCourses = await query(`
      SELECT 
        c.id, c.title, c.slug, c.category, c.status, c.created_at,
        u.first_name || ' ' || u.last_name as created_by_name
      FROM courses c
      LEFT JOIN users u ON c.created_by = u.id
      ORDER BY c.created_at DESC
      LIMIT 10
    `);

    console.log('All courses found:', allCourses.rows.length);

    return NextResponse.json({
      success: true,
      databaseConnected: true,
      totalCourses: allCourses.rows.length,
      courses: allCourses.rows,
      currentTime: timeResult.rows[0].current_time
    });

  } catch (error) {
    console.error('Debug courses error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
