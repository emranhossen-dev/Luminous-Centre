import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { sendEmail, getEmailTemplate } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    // Check if user exists and is active
    const userResult = await query(`
      SELECT id, first_name as "firstName", last_name as "lastName"
      FROM users
      WHERE email = $1 AND is_active = true
    `, [email.toLowerCase()]);

    if (userResult.rows.length === 0) {
      // Security measure: don't disclose whether email exists, return success
      return NextResponse.json({ 
        success: true, 
        message: 'If the email is registered, you will receive an OTP code shortly.' 
      });
    }

    const user = userResult.rows[0];

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('[SEND-OTP] Generated OTP:', otp, 'for email:', email);
    
    // OTP validity: 15 minutes from now
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    // Save OTP to database in reset_token
    await query(`
      UPDATE users 
      SET reset_token = $1, reset_token_expires = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [otp, expires, user.id]);

    const otpEmailHtml = getEmailTemplate({
      title: 'Password Reset OTP - Luminous Centre',
      heading: 'Your Password Reset OTP',
      bodyHtml: `
        <p>Hello <strong>${user.firstName} ${user.lastName}</strong>,</p>
        <p>You requested a password reset for your Luminous Centre account. Please use the following One-Time Password (OTP) to reset your password:</p>
        
        <div style="text-align: center; margin: 35px 0;">
          <div style="display: inline-block; background-color: #f1f5f9; border: 1px dashed #cbd5e1; color: #2563eb; font-size: 36px; font-weight: 800; letter-spacing: 8px; padding: 16px 32px; border-radius: 16px; font-family: monospace;">
            ${otp}
          </div>
        </div>
        
        <p style="font-size: 12px; color: #e11d48; font-weight: 500; margin-top: 20px;">
          * Note: This OTP is valid for 15 minutes. If you did not request a password reset, please ignore this email.
        </p>
      `
    });

    const emailResult = await sendEmail({
      to: email,
      subject: 'Password Reset OTP - Luminous Centre',
      html: otpEmailHtml
    });
    if (!emailResult.success) {
      console.error('[SEND-OTP] Email sending failed:', emailResult.error);
      return NextResponse.json({ 
        error: `Email sending failed: ${emailResult.error}` 
      }, { status: 500 });
    }

    const responseData: any = { 
      success: true, 
      message: 'OTP sent to your email.' 
    };

    if (process.env.NODE_ENV === 'development') {
      responseData.otp = otp;
    }

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
