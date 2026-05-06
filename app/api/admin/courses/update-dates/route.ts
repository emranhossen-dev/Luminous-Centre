import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { query } from '@/lib/database';

// POST /api/admin/courses/update-dates - Update enrollment and class dates for existing courses
export async function POST(req: NextRequest, context: { params: Promise<{}> }) {
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

    // Get all courses without enrollment_ends or class_starts
    const coursesToUpdate = await query(`
      SELECT id, title, created_at 
      FROM courses 
      WHERE enrollment_ends IS NULL OR class_starts IS NULL
      LIMIT 10
    `);

    if (coursesToUpdate.rows.length === 0) {
      return NextResponse.json({ 
        message: 'All courses already have enrollment and class dates',
        updated: 0
      });
    }

    // Update each course with sample dates
    const today = new Date();
    const updates = [];

    for (const course of coursesToUpdate.rows) {
      // Set enrollment_ends to 30 days from today
      const enrollmentEnds = new Date(today);
      enrollmentEnds.setDate(today.getDate() + 30);
      
      // Set class_starts to 35 days from today (5 days after enrollment ends)
      const classStarts = new Date(today);
      classStarts.setDate(today.getDate() + 35);

      await query(`
        UPDATE courses 
        SET enrollment_ends = $1, class_starts = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `, [
        enrollmentEnds.toISOString().split('T')[0], // Format as YYYY-MM-DD
        classStarts.toISOString().split('T')[0],
        course.id
      ]);

      updates.push({
        id: course.id,
        title: course.title,
        enrollment_ends: enrollmentEnds.toISOString().split('T')[0],
        class_starts: classStarts.toISOString().split('T')[0]
      });
    }

    return NextResponse.json({
      message: 'Successfully updated course dates',
      updated: updates.length,
      courses: updates
    });

  } catch (error) {
    console.error('Update course dates error:', error);
    return NextResponse.json(
      { error: 'Failed to update course dates' },
      { status: 500 }
    );
  }
}
