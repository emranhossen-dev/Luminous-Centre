import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { query, tableExists } from '@/lib/database';

// POST - Track video watch progress
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Auth required' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    const user = await getUserById(payload.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 401 });

    const { lessonVideoId, watchedSeconds, totalSeconds, completed } = await req.json();
    if (!lessonVideoId) return NextResponse.json({ error: 'lessonVideoId required' }, { status: 400 });

    await query(
      `INSERT INTO student_video_progress (user_id, lesson_video_id, watched_seconds, total_seconds, completed, last_watched_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, lesson_video_id) 
       DO UPDATE SET 
         watched_seconds = GREATEST(student_video_progress.watched_seconds, $3),
         total_seconds = GREATEST(student_video_progress.total_seconds, $4),
         completed = $5 OR student_video_progress.completed,
         last_watched_at = CURRENT_TIMESTAMP`,
      [user.id, parseInt(lessonVideoId), watchedSeconds || 0, totalSeconds || 0, completed || false]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Video progress error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - Get video progress for a course
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Auth required' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    const user = await getUserById(payload.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 });

    if (!(await tableExists('student_video_progress'))) {
      return NextResponse.json({ progress: [] });
    }

    const result = await query(
      `SELECT svp.lesson_video_id, svp.watched_seconds, svp.total_seconds, svp.completed
       FROM student_video_progress svp
       JOIN lesson_videos lv ON svp.lesson_video_id = lv.id
       JOIN curriculum_topics ct ON lv.lesson_id = ct.id
       JOIN curriculum_modules cm ON ct.module_id = cm.id
       WHERE svp.user_id = $1 AND cm.course_id = $2`,
      [user.id, parseInt(courseId)]
    );

    return NextResponse.json({ progress: result.rows });
  } catch (error: any) {
    console.error('Get video progress error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
