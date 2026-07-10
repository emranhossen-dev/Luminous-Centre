import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    // Check if user exists and is a staff member (roleName !== 'student')
    const userResult = await query(`
      SELECT u.id, u.first_name as "firstName", u.last_name as "lastName", r.name as "roleName"
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.email = $1 AND u.is_active = true
    `, [email.toLowerCase()]);

    if (userResult.rows.length === 0) {
      // Return success true even if user doesn't exist for security reasons (prevents email enumeration)
      console.log(`[FORGOT-PASSWORD] Password reset requested for unregistered/inactive email: ${email}`);
      return NextResponse.json({ 
        success: true, 
        message: 'If this email is registered, you will receive a reset link shortly.' 
      });
    }

    const user = userResult.rows[0];

    // We allow both staff and student accounts to reset password via this unified flow
    
    // Generate secure token and expiry time (1 hour from now)
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hour validity

    // Save reset token to database
    await query(`
      UPDATE users 
      SET reset_token = $1, reset_token_expires = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [token, expires, user.id]);

    // Send email with reset link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;

    const resetHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); color: #1e293b;">
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="display: inline-block; background-color: #2563eb; color: white; padding: 12px; border-radius: 12px; font-weight: bold; font-size: 20px; letter-spacing: 0.5px;">Luminous Skills</div>
        </div>
        <h2 style="color: #0f172a; font-size: 20px; font-weight: bold; margin-bottom: 15px;">Reset Your Password</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">Hello <strong>${user.firstName} ${user.lastName}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">We received a request to reset the password for your Luminous Skills account. Click the button below to set a new password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 12px; font-weight: bold; font-size: 14px; text-decoration: none; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
            Reset Password
          </a>
        </div>
        
        <p style="font-size: 13px; line-height: 1.6; color: #475569;">
          Or copy and paste this link in your browser:
        </p>
        <p style="font-size: 12px; color: #2563eb; word-break: break-all; background-color: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #f1f5f9;">
          ${resetUrl}
        </p>
        
        <p style="font-size: 12px; color: #e11d48; font-weight: 500; margin-top: 20px;">
          * Note: This password reset link is valid for 1 hour. If you did not request this reset, please ignore this email or contact support.
        </p>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 25px 0;" />
        <p style="font-size: 11px; text-align: center; color: #94a3b8; margin: 0;">
          Luminous Skill Development Center.
        </p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: 'Reset Password Request - Luminous Skills',
      html: resetHtml
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Password reset link sent successfully.' 
    });

  } catch (error: any) {
    console.error('Forgot password endpoint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
