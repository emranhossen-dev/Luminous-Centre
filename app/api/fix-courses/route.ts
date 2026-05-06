import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST() {
  try {
    // Update all draft courses to published
    const updateResult = await query(`
      UPDATE courses 
      SET status = 'published' 
      WHERE status = 'draft'
      RETURNING id, title, slug, status
    `);

    console.log('Updated courses to published:', updateResult.rows);

    return NextResponse.json({
      success: true,
      message: `Updated ${updateResult.rows.length} courses to published status`,
      updatedCourses: updateResult.rows
    });

  } catch (error) {
    console.error('Failed to update courses:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
