import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'Email, OTP code, and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters long' }, { status: 400 });
    }

    // Fetch user by email
    const userResult = await query(`
      SELECT id, reset_token as "resetToken", reset_token_expires as "resetTokenExpires"
      FROM users
      WHERE email = $1 AND is_active = true
    `, [email.toLowerCase()]);

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userResult.rows[0];

    // Check if OTP code matches and is not expired
    if (!user.resetToken || user.resetToken !== otp) {
      return NextResponse.json({ error: 'Invalid OTP code' }, { status: 400 });
    }

    const expiryTime = new Date(user.resetTokenExpires);
    if (expiryTime < new Date()) {
      return NextResponse.json({ error: 'OTP code has expired' }, { status: 400 });
    }

    // Hash new password
    const hashed = await hashPassword(newPassword);

    // Update password and clear reset token
    await query(`
      UPDATE users
      SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [hashed, user.id]);

    return NextResponse.json({ 
      success: true, 
      message: 'Password reset successfully. You can now login with your new password.' 
    });

  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
