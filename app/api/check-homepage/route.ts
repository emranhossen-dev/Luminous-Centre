import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    // Check what courses exist and their status
    const allCourses = await query(`
      SELECT id, title, slug, category, status, featured, created_at
      FROM courses 
      ORDER BY created_at DESC
      LIMIT 10
    `);

    // Check what homepage query would return
    const homepageCourses = await query(`
      SELECT 
        c.*,
        COUNT(e.id) as enrollment_count
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      WHERE c.status = 'published'
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT 8
    `);

    return NextResponse.json({
      success: true,
      allCourses: allCourses.rows,
      homepageCourses: homepageCourses.rows,
      totalAllCourses: allCourses.rows.length,
      totalHomepageCourses: homepageCourses.rows.length,
      message: homepageCourses.rows.length > 0 
        ? 'Homepage should show courses' 
        : 'No published courses found for homepage'
    });

  } catch (error) {
    console.error('Homepage check error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
