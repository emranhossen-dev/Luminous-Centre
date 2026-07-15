import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { query } from '@/lib/database';

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
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    let countRes;
    let listRes;

    if (unreadOnly) {
      countRes = await query(
        'SELECT COUNT(*)::int as count FROM notifications WHERE recipient_id = $1 AND read_status = false',
        [user.id]
      );
      listRes = await query(
        'SELECT id, title, message, read_status as "readStatus", created_at as "createdAt" FROM notifications WHERE recipient_id = $1 AND read_status = false ORDER BY created_at DESC',
        [user.id]
      );
    } else {
      countRes = await query(
        'SELECT COUNT(*)::int as count FROM notifications WHERE recipient_id = $1 AND read_status = false',
        [user.id]
      );
      listRes = await query(
        'SELECT id, title, message, read_status as "readStatus", created_at as "createdAt" FROM notifications WHERE recipient_id = $1 ORDER BY created_at DESC LIMIT 50',
        [user.id]
      );
    }

    return NextResponse.json({
      notifications: listRes.rows,
      unreadCount: countRes.rows[0]?.count || 0
    });
  } catch (error: any) {
    console.error('GET notifications error:', error);
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

    const { notificationId, markAllRead } = await req.json();

    if (markAllRead) {
      await query(
        'UPDATE notifications SET read_status = true WHERE recipient_id = $1',
        [user.id]
      );
    } else if (notificationId) {
      await query(
        'UPDATE notifications SET read_status = true WHERE recipient_id = $1 AND id = $2',
        [user.id, notificationId]
      );
    } else {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('POST notifications error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
