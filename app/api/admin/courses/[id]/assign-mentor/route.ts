import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { withAdminAuth } from '@/lib/admin-auth';
import { logActivity } from '@/lib/auth';

async function handler(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
  adminUser: any
) {
  try {
    const { id } = await context.params;
    const { mentorId } = await req.json();

    const courseId = parseInt(id);

    // Verify course exists
    const courseCheck = await query('SELECT id, title FROM courses WHERE id = $1', [courseId]);
    if (courseCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    const course = courseCheck.rows[0];

    // If mentorId is provided, verify mentor exists
    if (mentorId) {
      const mentorCheck = await query('SELECT id, name FROM mentors WHERE id = $1 AND deleted_at IS NULL', [mentorId]);
      if (mentorCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
      }
    }

    // Update course mentor
    await query(
      'UPDATE courses SET mentor_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [mentorId || null, courseId]
    );

    // Log admin activity
    await logActivity(
      adminUser.userId,
      'admin.courses.assign_mentor',
      'course',
      courseId,
      { mentorId }
    );

    return NextResponse.json({
      success: true,
      message: mentorId ? 'Mentor assigned to course successfully! 🚀' : 'Mentor unassigned from course successfully! 🚀'
    });
  } catch (error: any) {
    console.error('Assign mentor error:', error);
    return NextResponse.json({ error: 'Failed to assign mentor', details: error.message }, { status: 500 });
  }
}

export const POST = withAdminAuth(handler);
export const PATCH = withAdminAuth(handler);
