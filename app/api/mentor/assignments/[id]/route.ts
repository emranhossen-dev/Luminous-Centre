import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { query } from '@/lib/database';
import { ensureLMSFeaturesSchema } from '@/lib/lms-features';

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await ensureLMSFeaturesSchema();
    const resolvedParams = await context.params;
    const assignmentId = parseInt(resolvedParams.id);

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    const user = await getUserById(payload.userId);
    if (!user || (user.roleName !== 'mentor' && user.roleName !== 'admin' && user.roleName !== 'employee')) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    const { title, description, maxMarks, dueDate, fileUrl } = await req.json();

    if (!title || !dueDate) {
      return NextResponse.json({ error: 'Title and Due Date are required' }, { status: 400 });
    }

    // Verify course belongs to mentor (if not admin/employee)
    if (user.roleName !== 'admin' && user.roleName !== 'employee') {
      const mentorRes = await query('SELECT id FROM mentors WHERE email = $1', [user.email]);
      if (mentorRes.rows.length === 0) {
        return NextResponse.json({ error: 'Mentor profile not found' }, { status: 404 });
      }
      const mentorId = mentorRes.rows[0].id;
      
      const ownerCheck = await query(
        `SELECT a.id 
         FROM assignments a
         JOIN courses c ON a.course_id = c.id
         WHERE a.id = $1 AND c.mentor_id = $2`,
        [assignmentId, mentorId]
      );
      if (ownerCheck.rows.length === 0) {
        return NextResponse.json({ error: 'You do not have permission to edit this assignment' }, { status: 403 });
      }
    }

    const updateQuery = `
      UPDATE assignments 
      SET title = $1, description = $2, max_marks = $3, due_date = $4, file_url = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING id
    `;
    const result = await query(updateQuery, [
      title,
      description || null,
      maxMarks || 100,
      dueDate,
      fileUrl || null,
      assignmentId
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Assignment updated successfully' });
  } catch (error: any) {
    console.error('Update assignment error:', error);
    return NextResponse.json({ error: 'Failed to update assignment', details: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await ensureLMSFeaturesSchema();
    const resolvedParams = await context.params;
    const assignmentId = parseInt(resolvedParams.id);

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    const user = await getUserById(payload.userId);
    if (!user || (user.roleName !== 'mentor' && user.roleName !== 'admin' && user.roleName !== 'employee')) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // Verify course belongs to mentor (if not admin/employee)
    if (user.roleName !== 'admin' && user.roleName !== 'employee') {
      const mentorRes = await query('SELECT id FROM mentors WHERE email = $1', [user.email]);
      if (mentorRes.rows.length === 0) {
        return NextResponse.json({ error: 'Mentor profile not found' }, { status: 404 });
      }
      const mentorId = mentorRes.rows[0].id;
      
      const ownerCheck = await query(
        `SELECT a.id 
         FROM assignments a
         JOIN courses c ON a.course_id = c.id
         WHERE a.id = $1 AND c.mentor_id = $2`,
        [assignmentId, mentorId]
      );
      if (ownerCheck.rows.length === 0) {
        return NextResponse.json({ error: 'You do not have permission to delete this assignment' }, { status: 403 });
      }
    }

    const result = await query('DELETE FROM assignments WHERE id = $1 RETURNING id', [assignmentId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Assignment deleted successfully' });
  } catch (error: any) {
    console.error('Delete assignment error:', error);
    return NextResponse.json({ error: 'Failed to delete assignment', details: error.message }, { status: 500 });
  }
}
