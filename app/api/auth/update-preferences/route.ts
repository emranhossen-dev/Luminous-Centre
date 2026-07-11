import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
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

    const { 
      language, 
      timezone, 
      theme, 
      notificationsEmail, 
      notificationsSms, 
      notificationsMarketing, 
      notificationsCourseUpdates 
    } = await req.json();

    // Update preferences in the database
    await query(`
      UPDATE users
      SET 
        language = $1,
        timezone = $2,
        theme = $3,
        notifications_email = $4,
        notifications_sms = $5,
        notifications_marketing = $6,
        notifications_course_updates = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8 AND is_active = true
    `, [
      language, 
      timezone, 
      theme, 
      notificationsEmail, 
      notificationsSms, 
      notificationsMarketing, 
      notificationsCourseUpdates, 
      decoded.userId
    ]);

    // Insert activity log
    await query(`
      INSERT INTO activity_logs (user_id, action, resource_type, details)
      VALUES ($1, $2, $3, $4)
    `, [
      decoded.userId,
      'Preferences Updated',
      'User',
      JSON.stringify({ 
        message: 'User dashboard preferences and notification triggers updated',
        theme, 
        language, 
        timezone 
      })
    ]);

    return NextResponse.json({ success: true, message: 'Preferences updated successfully' });

  } catch (error: any) {
    console.error('Update preferences error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
