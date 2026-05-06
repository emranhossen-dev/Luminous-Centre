import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { query } from '@/lib/database';

// GET /api/admin/courses/check-schema - Check if database has required columns
export async function GET(req: NextRequest, context: { params: Promise<{}> }) {
  try {
    // Authentication
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

    // Check if columns exist in courses table
    const schemaCheck = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'courses' 
      AND column_name IN ('enrollment_ends', 'class_starts')
      ORDER BY column_name
    `);

    // Check a sample course to see if data exists
    const sampleCourse = await query(`
      SELECT id, title, enrollment_ends, class_starts 
      FROM courses 
      WHERE enrollment_ends IS NOT NULL OR class_starts IS NOT NULL
      LIMIT 3
    `);

    return NextResponse.json({
      schema: {
        has_enrollment_ends: schemaCheck.rows.some(col => col.column_name === 'enrollment_ends'),
        has_class_starts: schemaCheck.rows.some(col => col.column_name === 'class_starts'),
        columns: schemaCheck.rows
      },
      sample_data: sampleCourse.rows,
      total_courses_with_dates: sampleCourse.rows.length
    });

  } catch (error) {
    console.error('Schema check error:', error);
    return NextResponse.json(
      { error: 'Failed to check database schema', details: error.message },
      { status: 500 }
    );
  }
}
