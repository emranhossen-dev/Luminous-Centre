import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { query, tableExists } from '@/lib/database';

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
    const lessonVideoId = searchParams.get('lessonVideoId');
    if (!lessonVideoId) return NextResponse.json({ error: 'lessonVideoId required' }, { status: 400 });

    if (!(await tableExists('lesson_tasks'))) {
      return NextResponse.json({ tasks: [] });
    }

    const result = await query(
      'SELECT id, title, description, due_date FROM lesson_tasks WHERE lesson_video_id = $1 ORDER BY created_at ASC',
      [parseInt(lessonVideoId)]
    );

    return NextResponse.json({ tasks: result.rows });
  } catch (error: any) {
    console.error('Get lesson tasks error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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

    if (user.roleName !== 'mentor' && user.roleName !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { videoId, title, description, dueDate } = await req.json();
    if (!videoId || !title) {
      return NextResponse.json({ error: 'videoId and title are required' }, { status: 400 });
    }

    if (!(await tableExists('lesson_tasks'))) {
      return NextResponse.json({ error: 'Database table lesson_tasks does not exist' }, { status: 500 });
    }

    const result = await query(
      'INSERT INTO lesson_tasks (lesson_video_id, title, description, due_date) VALUES ($1, $2, $3, $4) RETURNING *',
      [parseInt(videoId), title, description || '', dueDate || null]
    );

    return NextResponse.json({ success: true, task: result.rows[0] });
  } catch (error: any) {
    console.error('Create lesson task error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

