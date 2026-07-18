import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { sendEmail, getEmailTemplate } from '@/lib/email';
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
    const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://luminouscentre.org';
    const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;

    const resetHtml = getEmailTemplate({
      title: 'Reset Password - Luminous Centre',
      heading: 'Reset Your Password',
      bodyHtml: `
        <p>Hello <strong>${user.firstName} ${user.lastName}</strong>,</p>
        <p>We received a request to reset the password for your Luminous Centre account. Click the button below to set a new password:</p>
        
        <p style="font-size: 13px; line-height: 1.6; color: #475569;">
          Or copy and paste this link in your browser:
        </p>
        <p style="font-size: 12px; color: #2563eb; word-break: break-all; background-color: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid #f1f5f9;">
          ${resetUrl}
        </p>
        
        <p style="font-size: 12px; color: #e11d48; font-weight: 500; margin-top: 20px;">
          * Note: This password reset link is valid for 1 hour. If you did not request this reset, please ignore this email.
        </p>
      `,
      ctaText: 'Reset Password',
      ctaLink: resetUrl
    });

    await sendEmail({
      to: email,
      subject: 'Reset Password Request - Luminous Centre',
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
