import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyToken, getUserById } from '@/lib/auth';
import { getStorageProvider } from '@/lib/video-storage';

export async function POST(req: NextRequest) {
  try {
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

    // 2. Parse Form Data
    const formData = await req.formData();
    const file = formData.get('video') as File | null;
    const lessonIdStr = formData.get('lesson_id') as string | null;
    const courseIdStr = formData.get('course_id') as string | null;
    const title = formData.get('title') as string | null;
    const duration = formData.get('duration') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No video file provided.' }, { status: 400 });
    }

    if (!courseIdStr) {
      return NextResponse.json({ error: 'course_id is required.' }, { status: 400 });
    }

    // 3. Validation (Format & Size)
    const allowedExtensions = ['.mp4', '.mkv', '.mov'];
    const fileName = file.name.toLowerCase();
    const lastDotIndex = fileName.lastIndexOf('.');
    const ext = lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : '';

    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json({ 
        error: `Invalid file format "${ext}". Only mp4, mkv, and mov video files are allowed.` 
      }, { status: 400 });
    }

    const MAX_SIZE = 2 * 1024 * 1024 * 1024; // 2 GB MTProto Limit
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ 
        error: `File size exceeds the maximum MTProto limit of 2 GB (your file is ${(file.size / (1024 * 1024 * 1024)).toFixed(2)} GB).` 
      }, { status: 400 });
    }

    // 4. Convert File stream to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 5. Upload to Video Storage Provider (Telegram bot API)
    const storageProvider = getStorageProvider();
    const uploadResult = await storageProvider.uploadVideo(
      buffer,
      file.name,
      file.type,
      title || file.name
    );

    // 6. Save metadata to lesson_videos table
    const courseId = parseInt(courseIdStr, 10);
    const lessonId = lessonIdStr ? parseInt(lessonIdStr, 10) : null;

    const insertResult = await query(`
      INSERT INTO lesson_videos (lesson_id, course_id, telegram_file_id, title, duration, created_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING id, title, duration, created_at
    `, [
      lessonId,
      courseId,
      uploadResult.fileId,
      title || file.name,
      duration || null
    ]);

    console.log(`[VIDEO-UPLOAD] Lesson video metadata saved to database. ID: ${insertResult.rows[0].id}`);

    return NextResponse.json({
      success: true,
      message: 'Video uploaded and cataloged successfully! 🚀',
      video: insertResult.rows[0]
    });

  } catch (error: any) {
    console.error('[VIDEO-UPLOAD] Error during processing:', error);
    return NextResponse.json({ 
      error: 'Internal video processing failed.', 
      details: error.message 
    }, { status: 500 });
  }
}
