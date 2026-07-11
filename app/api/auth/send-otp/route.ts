import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { sendEmail } from '@/lib/email';

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

    const otpEmailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); color: #1e293b;">
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="display: inline-block; background-color: #2563eb; color: white; padding: 12px; border-radius: 12px; font-weight: bold; font-size: 20px; letter-spacing: 0.5px;">Luminous Skills</div>
        </div>
        <h2 style="color: #0f172a; font-size: 20px; font-weight: bold; margin-bottom: 15px;">Your Password Reset OTP</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">Hello <strong>${user.firstName} ${user.lastName}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">You requested a password reset for your Luminous Skills account. Please use the following One-Time Password (OTP) to reset your password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; background-color: #f1f5f9; border: 1px dashed #cbd5e1; color: #2563eb; font-size: 32px; font-weight: 800; letter-spacing: 8px; padding: 16px 32px; border-radius: 16px;">
            ${otp}
          </div>
        </div>
        
        <p style="font-size: 12px; color: #e11d48; font-weight: 500; margin-top: 20px;">
          * Note: This OTP is valid for 15 minutes. If you did not request a password reset, please ignore this email.
        </p>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 25px 0;" />
        <p style="font-size: 11px; text-align: center; color: #94a3b8; margin: 0;">
          Luminous Skill Development Center.
        </p>
      </div>
    `;

    const emailResult = await sendEmail({
      to: email,
      subject: 'Password Reset OTP - Luminous Skills',
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
