import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { query } from '@/lib/database';
import { ensureLMSFeaturesSchema } from '@/lib/lms-features';

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await ensureLMSFeaturesSchema();
    const resolvedParams = await context.params;
    const recordingId = parseInt(resolvedParams.id);

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

    const { title, videoUrl, thumbnailUrl, downloadUrl, duration, recordedAt } = await req.json();

    if (!title || !videoUrl) {
      return NextResponse.json({ error: 'Title and Video URL are required' }, { status: 400 });
    }

    // Verify course belongs to mentor (if not admin/employee)
    if (user.roleName !== 'admin' && user.roleName !== 'employee') {
      const mentorRes = await query('SELECT id FROM mentors WHERE email = $1', [user.email]);
      if (mentorRes.rows.length === 0) {
        return NextResponse.json({ error: 'Mentor profile not found' }, { status: 404 });
      }
      const mentorId = mentorRes.rows[0].id;
      
      const ownerCheck = await query(
        `SELECT r.id 
         FROM class_recordings r
         JOIN courses c ON r.course_id = c.id
         WHERE r.id = $1 AND c.mentor_id = $2`,
        [recordingId, mentorId]
      );
      if (ownerCheck.rows.length === 0) {
        return NextResponse.json({ error: 'You do not have permission to edit this recording' }, { status: 403 });
      }
    }

    const updateQuery = `
      UPDATE class_recordings 
      SET title = $1, video_url = $2, thumbnail_url = $3, download_url = $4, duration = $5, recorded_at = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING id
    `;
    const result = await query(updateQuery, [
      title,
      videoUrl,
      thumbnailUrl || null,
      downloadUrl || null,
      duration || null,
      recordedAt || null,
      recordingId
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Recording updated successfully' });
  } catch (error: any) {
    console.error('Update recording error:', error);
    return NextResponse.json({ error: 'Failed to update recording', details: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await ensureLMSFeaturesSchema();
    const resolvedParams = await context.params;
    const recordingId = parseInt(resolvedParams.id);

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
        `SELECT r.id 
         FROM class_recordings r
         JOIN courses c ON r.course_id = c.id
         WHERE r.id = $1 AND c.mentor_id = $2`,
        [recordingId, mentorId]
      );
      if (ownerCheck.rows.length === 0) {
        return NextResponse.json({ error: 'You do not have permission to delete this recording' }, { status: 403 });
      }
    }

    const result = await query('DELETE FROM class_recordings WHERE id = $1 RETURNING id', [recordingId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Recording deleted successfully' });
  } catch (error: any) {
    console.error('Delete recording error:', error);
    return NextResponse.json({ error: 'Failed to delete recording', details: error.message }, { status: 500 });
  }
}
