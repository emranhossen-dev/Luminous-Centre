import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { getStreamingProvider } from '@/lib/video-storage';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const videoId = parseInt(id, 10);

    if (isNaN(videoId)) {
      return new Response('Invalid Video ID', { status: 400 });
    }

    // 1. Authenticate User (Accepts either standard Bearer Header or token query param for <video> tags)
    let token = '';
    const authHeader = req.headers.get('authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      const urlToken = req.nextUrl.searchParams.get('token');
      if (urlToken) {
        token = urlToken;
      }
    }

    if (!token) {
      return new Response('Unauthorized: Token is required for secure video streaming.', { status: 401 });
    }

    let payload: any;
    try {
      payload = verifyToken(token);
    } catch (err) {
      return new Response('Unauthorized: Invalid or expired token.', { status: 401 });
    }

    // Fetch user role
    const userResult = await query(`
      SELECT u.id, r.name as role_name 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1
    `, [payload.userId]);

    const user = userResult.rows[0];
    if (!user) {
      return new Response('Unauthorized: User accounts invalid.', { status: 401 });
    }

    // 2. Fetch Video Metadata
    const videoResult = await query(`
      SELECT * FROM lesson_videos WHERE id = $1
    `, [videoId]);

    const video = videoResult.rows[0];
    if (!video) {
      return new Response('Video not found.', { status: 404 });
    }

    // 3. Verify access permissions (students must have active enrollment)
    if (user.role_name === 'student') {
      const enrollmentCheck = await query(`
        SELECT id FROM enrollments 
        WHERE user_id = $1 AND course_id = $2
      `, [user.id, video.course_id]);

      if (enrollmentCheck.rows.length === 0) {
        return new Response('Forbidden: You are not enrolled in this course.', { status: 403 });
      }
    }

    // 4. Request video stream chunk from Telegram CDN
    const rangeHeader = req.headers.get('Range') || undefined;
    const storageProvider = getStreamingProvider(video.telegram_file_id);
    
    const streamResult = await storageProvider.streamVideo(video.telegram_file_id, rangeHeader);

    // 5. Pipe/Return stream response securely
    return new Response(streamResult.stream, {
      status: streamResult.status,
      headers: streamResult.headers
    });

  } catch (error: any) {
    console.error('[VIDEO-STREAM] Streaming error:', error);
    return new Response('Secure video stream loading failed.', { status: 500 });
  }
}
