import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    // Simple test to get published courses for homepage
    const result = await query(`
      SELECT 
        c.id, c.title, c.slug, c.category, c.price, c.old_price,
        c.thumbnail_url, c.status, c.level, c.duration_weeks, c.total_hours,
        c.batch, c.created_at,
        COUNT(e.id) as enrollment_count
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      WHERE c.status = 'published'
      GROUP BY c.id, c.title, c.slug, c.category, c.price, c.old_price,
               c.thumbnail_url, c.status, c.level, c.duration_weeks, c.total_hours,
               c.batch, c.created_at
      ORDER BY c.created_at DESC
      LIMIT 8
    `);

    console.log('Public courses query result:', result.rows);

    return NextResponse.json({
      success: true,
      courses: result.rows,
      totalCourses: result.rows.length
    });

  } catch (error) {
    console.error('Public courses error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      courses: []
    }, { status: 500 });
  }
}
