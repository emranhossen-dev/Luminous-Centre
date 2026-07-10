import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { sendEmail } from '@/lib/email';
import bcrypt from 'bcryptjs';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { status } = body;

  // Validate status
  const validStatuses = ['waiting', 'admitted', 'rejected'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json(
      { error: 'Invalid status' },
      { status: 400 }
    );
  }

  try {
    // 1. Fetch current application details
    const appResult = await query(`
      SELECT full_name, email, mobile_no, course, status 
      FROM applications 
      WHERE id = $1
    `, [id]);

    if (appResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const appData = appResult.rows[0];
    const prevStatus = appData.status;

    // 2. Update application status
    const result = await query(`
      UPDATE applications 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING id, status, updated_at
    `, [status, id]);

    const updatedApplication = result.rows[0];

    // 3. If transitioning to 'admitted', handle user account creation and email
    if (status === 'admitted' && prevStatus !== 'admitted') {
      const emailLower = appData.email.toLowerCase();
      
      // Check if user already exists
      const userCheck = await query(`SELECT id FROM users WHERE email = $1`, [emailLower]);
      
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const loginUrl = `${appUrl}/login`;

      if (userCheck.rows.length === 0) {
        // Generate a random demo password (length 10: base36 string + 'A1!')
        const demoPassword = Math.random().toString(36).slice(-8) + 'A1!';
        const passwordHash = await bcrypt.hash(demoPassword, 12);

        // Fetch student role ID
        const roleRes = await query("SELECT id FROM roles WHERE name = 'student'");
        const roleId = roleRes.rows[0]?.id || 5;

        // Split full name
        const nameParts = (appData.full_name || '').trim().split(' ');
        const firstName = nameParts[0] || 'Student';
        const lastName = nameParts.slice(1).join(' ') || 'User';

        // Create student user in users table
        await query(`
          INSERT INTO users (email, password_hash, first_name, last_name, phone, role_id, is_active, email_verified)
          VALUES ($1, $2, $3, $4, $5, $6, true, true)
        `, [emailLower, passwordHash, firstName, lastName, appData.mobile_no || null, roleId]);

        // Send email with demo password
        const welcomeHtml = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); color: #1e293b;">
            <div style="text-align: center; margin-bottom: 25px;">
              <div style="display: inline-block; background-color: #2563eb; color: white; padding: 12px; border-radius: 12px; font-weight: bold; font-size: 20px; letter-spacing: 0.5px;">Luminous Skills</div>
            </div>
            <h2 style="color: #0f172a; font-size: 20px; font-weight: bold; margin-bottom: 15px;">Congratulations! Your Admission is Approved</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #475569;">Hello <strong>${appData.full_name}</strong>,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #475569;">We are excited to inform you that your application for the course <strong>${appData.course}</strong> has been approved and you have been admitted!</p>
            <p style="font-size: 14px; line-height: 1.6; color: #475569;">A student account has been created for you. You can log in using the details below:</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 16px; margin: 25px 0; border: 1px solid #f1f5f9; font-size: 14px;">
              <p style="margin: 0 0 10px 0; color: #475569;"><strong>Login URL:</strong> <a href="${loginUrl}" style="color: #2563eb; text-decoration: none; font-weight: 500;">${loginUrl}</a></p>
              <p style="margin: 0 0 10px 0; color: #475569;"><strong>Username / Email:</strong> ${appData.email}</p>
              <p style="margin: 0; color: #475569;"><strong>Temporary Password:</strong> <code style="background-color: #e2e8f0; padding: 3px 8px; border-radius: 6px; font-family: monospace; font-size: 13px; font-weight: bold; color: #0f172a;">${demoPassword}</code></p>
            </div>
            
            <p style="font-size: 13px; color: #e11d48; font-weight: 500; margin-top: 20px;">
              * Important: Please log in and reset your password immediately for safety. You can do this via the forgot-password link or your dashboard.
            </p>
            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 25px 0;" />
            <p style="font-size: 11px; text-align: center; color: #94a3b8; margin: 0;">
              Luminous Skill Development Center Training Management Platform.
            </p>
          </div>
        `;

        await sendEmail({
          to: appData.email,
          subject: 'Your Admission is Approved! - Luminous Skills',
          html: welcomeHtml
        });

      } else {
        // User already exists, send email that admission is approved
        const welcomeHtml = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); color: #1e293b;">
            <div style="text-align: center; margin-bottom: 25px;">
              <div style="display: inline-block; background-color: #2563eb; color: white; padding: 12px; border-radius: 12px; font-weight: bold; font-size: 20px; letter-spacing: 0.5px;">Luminous Skills</div>
            </div>
            <h2 style="color: #0f172a; font-size: 20px; font-weight: bold; margin-bottom: 15px;">Congratulations! Your Admission is Approved</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #475569;">Hello <strong>${appData.full_name}</strong>,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #475569;">We are excited to inform you that your application for the course <strong>${appData.course}</strong> has been approved and you have been admitted!</p>
            <p style="font-size: 14px; line-height: 1.6; color: #475569;">Since you already have a registered account on our portal, you can log in directly using your existing credentials:</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 16px; margin: 25px 0; border: 1px solid #f1f5f9; font-size: 14px;">
              <p style="margin: 0 0 10px 0; color: #475569;"><strong>Login URL:</strong> <a href="${loginUrl}" style="color: #2563eb; text-decoration: none; font-weight: 500;">${loginUrl}</a></p>
              <p style="margin: 0; color: #475569;"><strong>Username / Email:</strong> ${appData.email}</p>
            </div>
            
            <p style="font-size: 13px; color: #475569; margin-top: 20px;">
              If you forgot your password, you can use the password reset link on the login page.
            </p>
            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 25px 0;" />
            <p style="font-size: 11px; text-align: center; color: #94a3b8; margin: 0;">
              Luminous Skill Development Center Training Management Platform.
            </p>
          </div>
        `;

        await sendEmail({
          to: appData.email,
          subject: 'Admission Approved! - Luminous Skills',
          html: welcomeHtml
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Application status updated successfully',
      updatedAt: updatedApplication.updated_at
    });
  } catch (error: any) {
    console.error('Error updating application status:', error);
    return NextResponse.json(
      { error: 'Failed to update application status' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Delete application
    const result = await query(`
      DELETE FROM applications 
      WHERE id = $1 
      RETURNING id
    `, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    );
  }
}