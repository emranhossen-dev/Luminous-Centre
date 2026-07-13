import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { query, tableExists } from '@/lib/database';

// GET - Fetch notes for a specific lesson video
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

    if (!(await tableExists('student_lesson_notes'))) {
      return NextResponse.json({ content: '' });
    }

    const result = await query(
      'SELECT content FROM student_lesson_notes WHERE user_id = $1 AND lesson_video_id = $2',
      [user.id, parseInt(lessonVideoId)]
    );

    return NextResponse.json({ content: result.rows[0]?.content || '' });
  } catch (error: any) {
    console.error('Get lesson notes error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Save/update notes for a specific lesson video
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

    const { lessonVideoId, content } = await req.json();
    if (!lessonVideoId) return NextResponse.json({ error: 'lessonVideoId required' }, { status: 400 });

    await query(
      `INSERT INTO student_lesson_notes (user_id, lesson_video_id, content, updated_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, lesson_video_id) 
       DO UPDATE SET content = $3, updated_at = CURRENT_TIMESTAMP`,
      [user.id, parseInt(lessonVideoId), content || '']
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Save lesson notes error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
