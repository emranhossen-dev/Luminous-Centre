import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { query } from '@/lib/database';
import { ensureLMSFeaturesSchema } from '@/lib/lms-features';

// GET /api/mentor/recordings - Get recordings for courses taught by the mentor
export async function GET(req: NextRequest) {
  try {
    await ensureLMSFeaturesSchema();

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

    let mentorId = null;
    if (user.roleName !== 'admin') {
      const mentorRes = await query('SELECT id FROM mentors WHERE email = $1', [user.email]);
      if (mentorRes.rows.length === 0) {
        return NextResponse.json({ error: 'Mentor profile not found' }, { status: 404 });
      }
      mentorId = mentorRes.rows[0].id;
    }

    // Query recordings. If admin, get all. If mentor, only their courses.
    let recordingsQuery = `
      SELECT 
        r.id,
        r.course_id as "courseId",
        r.title,
        r.video_url as "videoUrl",
        r.thumbnail_url as "thumbnailUrl",
        r.download_url as "downloadUrl",
        r.duration,
        r.views,
        r.recorded_at as "recordedAt",
        c.title as "courseTitle"
      FROM class_recordings r
      JOIN courses c ON r.course_id = c.id
    `;
    const params = [];
    if (mentorId) {
      recordingsQuery += ` WHERE c.mentor_id = $1`;
      params.push(mentorId);
    }
    recordingsQuery += ` ORDER BY r.recorded_at DESC`;

    const result = await query(recordingsQuery, params);
    return NextResponse.json({ recordings: result.rows });
  } catch (error: any) {
    console.error('Get mentor recordings error:', error);
    return NextResponse.json({ error: 'Failed to fetch recordings', details: error.message }, { status: 500 });
  }
}

// POST /api/mentor/recordings - Create a new class recording
export async function POST(req: NextRequest) {
  try {
    await ensureLMSFeaturesSchema();

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

    const { courseId, title, videoUrl, thumbnailUrl, downloadUrl, duration, recordedAt } = await req.json();

    if (!courseId || !title || !videoUrl) {
      return NextResponse.json({ error: 'Course, Title, and Video URL are required' }, { status: 400 });
    }

    // Verify course belongs to mentor (if not admin)
    if (user.roleName !== 'admin') {
      const mentorRes = await query('SELECT id FROM mentors WHERE email = $1', [user.email]);
      if (mentorRes.rows.length === 0) {
        return NextResponse.json({ error: 'Mentor profile not found' }, { status: 404 });
      }
      const mentorId = mentorRes.rows[0].id;
      
      const courseCheck = await query('SELECT id FROM courses WHERE id = $1 AND mentor_id = $2', [courseId, mentorId]);
      if (courseCheck.rows.length === 0 && user.roleName !== 'employee') {
        return NextResponse.json({ error: 'You do not teach this course' }, { status: 403 });
      }
    }

    const insertQuery = `
      INSERT INTO class_recordings (course_id, title, video_url, thumbnail_url, download_url, duration, recorded_at)
      VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, CURRENT_TIMESTAMP))
      RETURNING id, course_id as "courseId", title, video_url as "videoUrl", thumbnail_url as "thumbnailUrl", download_url as "downloadUrl", duration, recorded_at as "recordedAt"
    `;
    const result = await query(insertQuery, [
      courseId,
      title,
      videoUrl,
      thumbnailUrl || null,
      downloadUrl || null,
      duration || null,
      recordedAt || null
    ]);

    return NextResponse.json({ success: true, recording: result.rows[0] });
  } catch (error: any) {
    console.error('Create recording error:', error);
    return NextResponse.json({ error: 'Failed to create recording', details: error.message }, { status: 500 });
  }
}
