import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Fetch the 15 most recent activity logs for this user
    const logsResult = await query(`
      SELECT 
        id,
        action,
        resource_type as "resourceType",
        details,
        ip_address as "ipAddress",
        user_agent as "userAgent",
        created_at as "createdAt"
      FROM activity_logs
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 15
    `, [decoded.userId]);

    return NextResponse.json({ success: true, logs: logsResult.rows });

  } catch (error: any) {
    console.error('Fetch activity logs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
