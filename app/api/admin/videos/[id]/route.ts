import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const videoId = parseInt(id, 10);

    if (isNaN(videoId)) {
      return NextResponse.json({ error: 'Invalid Video ID' }, { status: 400 });
    }

    // 1. Authenticate user
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    // Fetch user and join role to confirm privileges
    const userResult = await query(`
      SELECT u.id, r.name as role_name 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1
    `, [payload.userId]);

    const user = userResult.rows[0];
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    if (user.role_name !== 'admin' && user.role_name !== 'mentor') {
      return NextResponse.json({ error: 'Unauthorized: Admin or Mentor privilege required.' }, { status: 403 });
    }

    // 2. Delete the video metadata from DB (Telegram files remain on channel, but metadata is un-cataloged)
    const deleteResult = await query(`
      DELETE FROM lesson_videos 
      WHERE id = $1
      RETURNING id, title
    `, [videoId]);

    if (deleteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Video not found or already deleted.' }, { status: 404 });
    }

    console.log(`[VIDEO-DELETE] Removed video catalog record. ID: ${videoId}, Title: ${deleteResult.rows[0].title}`);

    return NextResponse.json({
      success: true,
      message: 'Video uncataloged successfully.'
    });

  } catch (error: any) {
    console.error('[VIDEO-DELETE] Error deleting video record:', error);
    return NextResponse.json({ 
      error: 'Failed to delete video record.', 
      details: error.message 
    }, { status: 500 });
  }
}
