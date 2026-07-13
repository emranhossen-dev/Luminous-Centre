import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import jwt from 'jsonwebtoken';
import { sendEmail, getEmailTemplate } from '@/lib/email';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded: any;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    const adminCheck = await query(
      `SELECT r.name as role FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = $1`,
      [decoded.userId || decoded.id]
    );

    if (adminCheck.rows.length === 0 || adminCheck.rows[0].role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const enrollmentId = id;
    const body = await request.json();

    // Build dynamic update query
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    // Add fields to update based on request body
    if (body.enrollment_status !== undefined) {
      updateFields.push(`enrollment_status = $${paramIndex++}`);
      updateValues.push(body.enrollment_status);
    }

    if (body.payment_status !== undefined) {
      updateFields.push(`payment_status = $${paramIndex++}`);
      updateValues.push(body.payment_status);
    }

    if (body.admin_note !== undefined) {
      updateFields.push(`admin_note = $${paramIndex++}`);
      updateValues.push(body.admin_note);
    }

    if (body.full_name !== undefined) {
      updateFields.push(`full_name = $${paramIndex++}`);
      updateValues.push(body.full_name);
    }

    if (body.email !== undefined) {
      updateFields.push(`email = $${paramIndex++}`);
      updateValues.push(body.email);
    }

    if (body.mobile_number !== undefined) {
      updateFields.push(`mobile_number = $${paramIndex++}`);
      updateValues.push(body.mobile_number);
    }

    if (body.whatsapp_number !== undefined) {
      updateFields.push(`whatsapp_number = $${paramIndex++}`);
      updateValues.push(body.whatsapp_number);
    }

    if (body.course_title !== undefined) {
      updateFields.push(`course_title = $${paramIndex++}`);
      updateValues.push(body.course_title);
    }

    if (body.course_category !== undefined) {
      updateFields.push(`course_category = $${paramIndex++}`);
      updateValues.push(body.course_category);
    }

    if (body.batch_name !== undefined) {
      updateFields.push(`batch_name = $${paramIndex++}`);
      updateValues.push(body.batch_name);
    }

    if (body.amount !== undefined) {
      updateFields.push(`amount = $${paramIndex++}`);
      updateValues.push(body.amount);
    }

    if (body.promo_code !== undefined) {
      updateFields.push(`promo_code = $${paramIndex++}`);
      updateValues.push(body.promo_code);
    }

    // Always update reviewed_by and reviewed_at when making changes
    updateFields.push(`reviewed_by = $${paramIndex++}`);
    updateValues.push(decoded.userId || decoded.id);
    
    updateFields.push(`reviewed_at = $${paramIndex++}`);
    updateValues.push(new Date());

    // Add enrollment ID as the last parameter
    updateValues.push(enrollmentId);

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Execute update query
    const updateQuery = `
      UPDATE course_enrollment_requests 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    const result = await query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    // Sync student info to users/students table if email/name/phone was updated
    if (body.full_name !== undefined || body.email !== undefined || body.mobile_number !== undefined) {
      const currentRequest = result.rows[0];
      const userId = currentRequest.user_id;
      
      if (userId) {
        // Fetch old email to update students table properly
        const oldUserRes = await query('SELECT email FROM users WHERE id = $1', [userId]);
        const oldEmail = oldUserRes.rows[0]?.email;

        // Split full name
        const nameParts = (body.full_name || currentRequest.full_name || '').trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        const newEmail = (body.email || currentRequest.email || '').toLowerCase();
        const newPhone = body.mobile_number || currentRequest.mobile_number || null;

        // Update users table
        await query(
          `UPDATE users 
           SET first_name = $1, last_name = $2, email = $3, phone = $4 
           WHERE id = $5`,
          [firstName, lastName, newEmail, newPhone, userId]
        );

        // Update students table if exists
        if (oldEmail) {
          await query(
            `UPDATE students 
             SET name = $1, email = $2, phone = $3 
             WHERE email = $4`,
            [`${firstName} ${lastName}`.trim(), newEmail, newPhone, oldEmail.toLowerCase()]
          );
        }
      }
    }

    const enrollmentRequest = result.rows[0];
    let userId = enrollmentRequest.user_id;
    let generatedPassword = '';
    let isNewUserCreated = false;

    const emailLower = (body.email || enrollmentRequest.email || '').trim().toLowerCase();

    if (!userId && emailLower) {
      // It's a guest request! Check if user already exists
      const userCheck = await query('SELECT id FROM users WHERE email = $1', [emailLower]);
      
      if (userCheck.rows.length > 0) {
        userId = userCheck.rows[0].id;
        await query(
          'UPDATE course_enrollment_requests SET user_id = $1 WHERE id = $2',
          [userId, enrollmentId]
        );
        enrollmentRequest.user_id = userId;
      } else if (enrollmentRequest.enrollment_status === 'admitted' || enrollmentRequest.enrollment_status === 'approved') {
        // Create user since they are being admitted/approved
        const bcrypt = (await import('bcryptjs')).default;
        generatedPassword = Math.random().toString(36).slice(-8) + 'A1!';
        const passwordHash = await bcrypt.hash(generatedPassword, 12);

        // Fetch student role ID
        const roleRes = await query("SELECT id FROM roles WHERE name = 'student'");
        const roleId = roleRes.rows[0]?.id || 5;

        // Split full name
        const nameParts = (body.full_name || enrollmentRequest.full_name || 'Student').trim().split(' ');
        const firstName = nameParts[0] || 'Student';
        const lastName = nameParts.slice(1).join(' ') || 'User';
        const phone = body.mobile_number || enrollmentRequest.mobile_number || null;

        // Insert new user
        const newUserRes = await query(
          `INSERT INTO users (email, password_hash, first_name, last_name, phone, role_id, is_active, email_verified)
           VALUES ($1, $2, $3, $4, $5, $6, true, true)
           RETURNING id`,
          [emailLower, passwordHash, firstName, lastName, phone, roleId]
        );
        
        userId = newUserRes.rows[0].id;
        await query(
          'UPDATE course_enrollment_requests SET user_id = $1 WHERE id = $2',
          [userId, enrollmentId]
        );
        enrollmentRequest.user_id = userId;
        isNewUserCreated = true;
      }
    }

    // If enrollment is approved / admitted, create active course enrollment record & sync student profile
    if (userId && (enrollmentRequest.enrollment_status === 'admitted' || enrollmentRequest.enrollment_status === 'approved')) {
      const { createEnrollmentIfMissing } = await import('@/lib/enrollment');
      await createEnrollmentIfMissing(userId, enrollmentRequest.course_id);
    }

    // Fetch details for email notification and send email
    if (userId) {
      const detailResult = await query(
        `SELECT u.email, u.first_name as "firstName", u.last_name as "lastName", c.title as "courseTitle"
         FROM users u, courses c
         WHERE u.id = $1 AND c.id = $2`,
        [userId, enrollmentRequest.course_id]
      );

      if (detailResult.rows.length > 0) {
        const details = detailResult.rows[0];
        const isApproved = enrollmentRequest.enrollment_status === 'approved' || enrollmentRequest.enrollment_status === 'admitted';
        const emailSubject = isApproved
          ? 'Course Enrollment Approved! - Luminous Centre' 
          : 'Course Enrollment Update - Luminous Centre';

        let bodyHtml = '';
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const loginUrl = `${appUrl}/login`;

        if (isApproved) {
          if (isNewUserCreated) {
            bodyHtml = `
              <p>Hello <strong>${details.firstName} ${details.lastName}</strong>,</p>
              <p>We are excited to inform you that your enrollment request for the course <strong>${details.courseTitle}</strong> has been approved and you have been admitted!</p>
              <p>A student account has been created for you. You can log in using the details below:</p>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 16px; margin: 25px 0; border: 1px solid #f1f5f9; font-size: 14px;">
                <p style="margin: 0 0 10px 0; color: #475569;"><strong>Login URL:</strong> <a href="${loginUrl}" style="color: #2563eb; text-decoration: none; font-weight: 500;">${loginUrl}</a></p>
                <p style="margin: 0 0 10px 0; color: #475569;"><strong>Username / Email:</strong> ${details.email}</p>
                <p style="margin: 0; color: #475569;"><strong>Temporary Password:</strong> <code style="background-color: #e2e8f0; padding: 3px 8px; border-radius: 6px; font-family: monospace; font-size: 13px; font-weight: bold; color: #0f172a;">${generatedPassword}</code></p>
              </div>
              
              <p style="font-size: 13px; color: #e11d48; font-weight: 500; margin-top: 20px;">
                * Important: Please log in and reset your password immediately for safety.
              </p>
            `;
          } else {
            bodyHtml = `
              <p>Hello <strong>${details.firstName} ${details.lastName}</strong>,</p>
              <p>Your enrollment status for the course <strong>${details.courseTitle}</strong> has been approved and you have been admitted! 🎉</p>
              <p>You can now view and access your course materials directly on your student portal dashboard.</p>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 16px; margin: 25px 0; border: 1px solid #f1f5f9; font-size: 14px;">
                <p style="margin: 0 0 10px 0; color: #475569;"><strong>Login URL:</strong> <a href="${loginUrl}" style="color: #2563eb; text-decoration: none; font-weight: 500;">${loginUrl}</a></p>
                <p style="margin: 0; color: #475569;"><strong>Username / Email:</strong> ${details.email}</p>
              </div>
            `;
          }
        } else {
          bodyHtml = `
            <p>Hello <strong>${details.firstName} ${details.lastName}</strong>,</p>
            <p>Your enrollment status for the course <strong>${details.courseTitle}</strong> has been updated.</p>
            
            <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 12px; margin: 20px 0; color: #991b1b;">
              <p style="margin: 0; font-size: 15px; font-weight: bold;">
                Status: Declined / Rejected
              </p>
              ${enrollmentRequest.admin_note ? `<p style="margin: 10px 0 0 0; font-size: 13px; color: #475569;"><strong>Admin Remark:</strong> ${enrollmentRequest.admin_note}</p>` : ''}
            </div>
            <p>If you have any queries about this enrollment status, feel free to contact the training center administration.</p>
          `;
        }

        const statusHtml = getEmailTemplate({
          title: 'Enrollment Update - Luminous Centre',
          heading: isApproved ? 'Congratulations! Your Enrollment is Approved' : 'Enrollment Update',
          bodyHtml,
          ctaText: isApproved ? 'Go to My Courses' : undefined,
          ctaLink: isApproved ? `${appUrl}/student/my-courses` : undefined
        });

        await sendEmail({
          to: details.email,
          subject: emailSubject,
          html: statusHtml
        }).catch(err => console.error('[ENROLLMENT-UPDATE-EMAIL] Error sending status email:', err));
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Enrollment updated successfully',
      enrollment: enrollmentRequest
    });
  } catch (error) {
    console.error('Update enrollment error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
