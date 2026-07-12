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
    // Fetch full user details
    const userResult = await query(`
      SELECT 
        u.email,
        u.first_name as "firstName",
        u.last_name as "lastName",
        u.phone,
        u.date_of_birth as "dateOfBirth",
        u.gender,
        u.address,
        u.avatar_url as "avatarUrl",
        u.timezone,
        u.language,
        u.theme,
        u.notifications_email as "notificationsEmail",
        u.notifications_sms as "notificationsSms",
        u.notifications_marketing as "notificationsMarketing",
        u.notifications_course_updates as "notificationsCourseUpdates",
        u.designation,
        COALESCE(u.bio, m.bio) as "bio",
        m.skills as "skills",
        r.name as "roleName",
        u.created_at as "createdAt",
        u.last_login as "lastLogin"
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN mentors m ON LOWER(u.email) = LOWER(m.email)
      WHERE u.id = $1 AND u.is_active = true
    `, [decoded.userId]);

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found or inactive' }, { status: 404 });
    }

    return NextResponse.json({ success: true, profile: userResult.rows[0] });

  } catch (error: any) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
