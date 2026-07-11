import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyToken, verifyPassword, hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters long' }, { status: 400 });
    }

    // Fetch user password hash
    const userResult = await query(`
      SELECT password_hash as "passwordHash"
      FROM users
      WHERE id = $1 AND is_active = true
    `, [decoded.userId]);

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found or inactive' }, { status: 404 });
    }

    const user = userResult.rows[0];

    // Verify current password
    const isPasswordValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
    }

    // Hash new password and update
    const hashed = await hashPassword(newPassword);
    await query(`
      UPDATE users
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [hashed, decoded.userId]);

    // Insert activity log
    await query(`
      INSERT INTO activity_logs (user_id, action, resource_type, details)
      VALUES ($1, $2, $3, $4)
    `, [
      decoded.userId,
      'Password Changed',
      'User',
      JSON.stringify({ message: 'User password was changed securely' })
    ]);

    return NextResponse.json({ success: true, message: 'Password updated successfully' });

  } catch (error: any) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
