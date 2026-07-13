import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { sendEmail, getEmailTemplate } from '@/lib/email';
import bcrypt from 'bcryptjs';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { status, fullName, email, mobileNo, course, category, whatsappNo } = body;

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

    // 2. Build dynamic update query
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex++}`);
      updateValues.push(status);
    }
    if (fullName !== undefined) {
      updateFields.push(`full_name = $${paramIndex++}`);
      updateValues.push(fullName);
    }
    if (email !== undefined) {
      updateFields.push(`email = $${paramIndex++}`);
      updateValues.push(email);
    }
    if (mobileNo !== undefined) {
      updateFields.push(`mobile_no = $${paramIndex++}`);
      updateValues.push(mobileNo);
    }
    if (course !== undefined) {
      updateFields.push(`course = $${paramIndex++}`);
      updateValues.push(course);
    }
    if (category !== undefined) {
      updateFields.push(`category = $${paramIndex++}`);
      updateValues.push(category);
    }
    if (whatsappNo !== undefined) {
      updateFields.push(`whatsapp_no = $${paramIndex++}`);
      updateValues.push(whatsappNo);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    
    // Add id as last param
    updateValues.push(id);

    const updateQuery = `
      UPDATE applications 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, status, updated_at
    `;
    const result = await query(updateQuery, updateValues);
    const updatedApplication = result.rows[0];

    const finalStatus = status || prevStatus;
    const targetEmail = (email || appData.email).toLowerCase();
    const targetFullName = fullName || appData.full_name;
    const targetMobile = mobileNo || appData.mobile_no;
    const targetCourse = course || appData.course;

    // 3. If transitioning to 'admitted', handle user account creation and email
    if (finalStatus === 'admitted' && prevStatus !== 'admitted') {
      const emailLower = targetEmail.toLowerCase();
      
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
        const nameParts = targetFullName.trim().split(' ');
        const firstName = nameParts[0] || 'Student';
        const lastName = nameParts.slice(1).join(' ') || 'User';

        // Create student user in users table
        await query(`
          INSERT INTO users (email, password_hash, first_name, last_name, phone, role_id, is_active, email_verified)
          VALUES ($1, $2, $3, $4, $5, $6, true, true)
        `, [emailLower, passwordHash, firstName, lastName, targetMobile || null, roleId]);

        // Send email with demo password
        const welcomeHtml = getEmailTemplate({
          title: 'Admission Approved - Luminous Centre',
          heading: 'Congratulations! Your Admission is Approved',
          bodyHtml: `
            <p>Hello <strong>${targetFullName}</strong>,</p>
            <p>We are excited to inform you that your application for the course <strong>${targetCourse}</strong> has been approved and you have been admitted!</p>
            <p>A student account has been created for you. You can log in using the details below:</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 16px; margin: 25px 0; border: 1px solid #f1f5f9; font-size: 14px;">
              <p style="margin: 0 0 10px 0; color: #475569;"><strong>Login URL:</strong> <a href="${loginUrl}" style="color: #2563eb; text-decoration: none; font-weight: 500;">${loginUrl}</a></p>
              <p style="margin: 0 0 10px 0; color: #475569;"><strong>Username / Email:</strong> ${targetEmail}</p>
              <p style="margin: 0; color: #475569;"><strong>Temporary Password:</strong> <code style="background-color: #e2e8f0; padding: 3px 8px; border-radius: 6px; font-family: monospace; font-size: 13px; font-weight: bold; color: #0f172a;">${demoPassword}</code></p>
            </div>
            
            <p style="font-size: 13px; color: #e11d48; font-weight: 500; margin-top: 20px;">
              * Important: Please log in and reset your password immediately for safety. You can do this via the forgot-password link or your dashboard.
            </p>
          `,
          ctaText: 'Access Student Portal',
          ctaLink: loginUrl
        });

        await sendEmail({
          to: targetEmail,
          subject: 'Your Admission is Approved! - Luminous Centre',
          html: welcomeHtml
        });

      } else {
        // User already exists, send email that admission is approved
        const welcomeHtml = getEmailTemplate({
          title: 'Admission Approved - Luminous Centre',
          heading: 'Congratulations! Your Admission is Approved',
          bodyHtml: `
            <p>Hello <strong>${targetFullName}</strong>,</p>
            <p>We are excited to inform you that your application for the course <strong>${targetCourse}</strong> has been approved and you have been admitted!</p>
            <p>Since you already have a registered account on our portal, you can log in directly using your existing credentials:</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 16px; margin: 25px 0; border: 1px solid #f1f5f9; font-size: 14px;">
              <p style="margin: 0 0 10px 0; color: #475569;"><strong>Login URL:</strong> <a href="${loginUrl}" style="color: #2563eb; text-decoration: none; font-weight: 500;">${loginUrl}</a></p>
              <p style="margin: 0; color: #475569;"><strong>Username / Email:</strong> ${targetEmail}</p>
            </div>
            
            <p style="font-size: 13px; color: #475569; margin-top: 20px;">
              If you forgot your password, you can use the password reset link on the login page.
            </p>
          `,
          ctaText: 'Log In to Dashboard',
          ctaLink: loginUrl
        });

        await sendEmail({
          to: targetEmail,
          subject: 'Admission Approved! - Luminous Centre',
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