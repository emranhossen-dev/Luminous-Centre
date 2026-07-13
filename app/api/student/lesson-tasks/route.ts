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
