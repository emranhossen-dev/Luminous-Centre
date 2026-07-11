import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { query } from '@/lib/database';
import { detectEnrollmentUserColumn } from '@/lib/enrollment';
import { ensureLMSFeaturesSchema } from '@/lib/lms-features';

export async function GET(req: NextRequest) {
  try {
    // 1. Ensure tables exist
    await ensureLMSFeaturesSchema();

    // 2. Authentication check
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

    // 3. Get student enrolled course ids
    const userColumn = await detectEnrollmentUserColumn();
    const enrollmentsResult = await query(
      `SELECT course_id FROM enrollments WHERE ${userColumn} = $1 AND status = 'active'`,
      [user.id]
    );
    
    if (enrollmentsResult.rows.length === 0) {
      return NextResponse.json({ recordings: [] });
    }

    const courseIds = enrollmentsResult.rows.map(row => row.course_id);

    // 4. Fetch recordings for those courses
    const recordingsResult = await query(
      `SELECT 
        r.id,
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
       WHERE r.course_id = ANY($1)
       ORDER BY r.recorded_at DESC`,
      [courseIds]
    );

    return NextResponse.json({ recordings: recordingsResult.rows });
  } catch (error: any) {
    console.error('Get student recordings error:', error);
    return NextResponse.json({ error: 'Failed to fetch recordings', details: error.message }, { status: 500 });
  }
}
