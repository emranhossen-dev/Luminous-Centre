import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    // Check if token matches and is not expired
    const userResult = await query(`
      SELECT id, reset_token_expires as "expires"
      FROM users
      WHERE reset_token = $1
    `, [token]);

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    const user = userResult.rows[0];

    // Check expiry
    const expiryTime = new Date(user.expires);
    if (expiryTime.getTime() < Date.now()) {
      return NextResponse.json({ error: 'Password reset link has expired' }, { status: 400 });
    }

    // Hash the new password
    const passwordHash = await hashPassword(password);

    // Update password and clear token fields
    await query(`
      UPDATE users
      SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [passwordHash, user.id]);

    return NextResponse.json({ 
      success: true, 
      message: 'Password reset successfully. You can now log in.' 
    });

  } catch (error: any) {
    console.error('Reset password endpoint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
