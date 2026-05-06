import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST() {
  try {
    // Update all courses to published status
    const result = await query(`
      UPDATE courses 
      SET status = 'published' 
      WHERE status != 'published'
      RETURNING id, title, slug, status, created_at
    `);

    console.log('Published courses:', result.rows);

    return NextResponse.json({
      success: true,
      message: `Published ${result.rows.length} courses`,
      publishedCourses: result.rows
    });

  } catch (error) {
    console.error('Failed to publish courses:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
