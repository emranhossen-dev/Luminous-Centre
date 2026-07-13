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

    // If enrollment is approved / admitted, create active course enrollment record & sync student profile
    if (enrollmentRequest.enrollment_status === 'admitted' || enrollmentRequest.enrollment_status === 'approved') {
      const { createEnrollmentIfMissing } = await import('@/lib/enrollment');
      await createEnrollmentIfMissing(enrollmentRequest.user_id, enrollmentRequest.course_id);
    }

    // Fetch details for email notification
    const detailResult = await query(
      `SELECT u.email, u.first_name as "firstName", u.last_name as "lastName", c.title as "courseTitle"
       FROM users u, courses c
       WHERE u.id = $1 AND c.id = $2`,
      [enrollmentRequest.user_id, enrollmentRequest.course_id]
    );

    if (detailResult.rows.length > 0) {
      const details = detailResult.rows[0];
      const isApproved = enrollmentRequest.enrollment_status === 'approved' || enrollmentRequest.enrollment_status === 'admitted';
      const emailSubject = isApproved
        ? 'Course Enrollment Approved! - Luminous Centre' 
        : 'Course Enrollment Update - Luminous Centre';

      const statusHtml = getEmailTemplate({
        title: 'Enrollment Update - Luminous Centre',
        heading: 'Enrollment Update',
        bodyHtml: `
          <p>Hello <strong>${details.firstName} ${details.lastName}</strong>,</p>
          <p>Your enrollment status for the course <strong>${details.courseTitle}</strong> has been updated.</p>
          
          <div style="background-color: ${isApproved ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${isApproved ? '#bbf7d0' : '#fecaca'}; padding: 15px; border-radius: 12px; margin: 20px 0; color: ${isApproved ? '#166534' : '#991b1b'};">
            <p style="margin: 0; font-size: 15px; font-weight: bold;">
              Status: ${isApproved ? 'Approved & Admitted 🎉' : 'Declined / Rejected'}
            </p>
            ${enrollmentRequest.admin_note ? `<p style="margin: 10px 0 0 0; font-size: 13px; color: #475569;"><strong>Admin Remark:</strong> ${enrollmentRequest.admin_note}</p>` : ''}
          </div>
          
          ${isApproved ? `
            <p>You can now view your course on your student portal dashboard.</p>
          ` : `
            <p>If you have any queries about this enrollment status, feel free to contact the training center administration.</p>
          `}
        `,
        ctaText: isApproved ? 'Go to My Courses' : undefined,
        ctaLink: isApproved ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/student/my-courses` : undefined
      });

      sendEmail({
        to: details.email,
        subject: emailSubject,
        html: statusHtml
      }).catch(err => console.error('[ENROLLMENT-UPDATE-EMAIL] Error sending status email:', err));
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
