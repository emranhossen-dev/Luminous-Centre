import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import jwt from 'jsonwebtoken';
import { sendEmail } from '@/lib/email';

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
      'SELECT role FROM users WHERE id = $1',
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
        ? 'Course Enrollment Approved! - Luminous Skills' 
        : 'Course Enrollment Update - Luminous Skills';

      const statusHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); color: #1e293b;">
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="display: inline-block; background-color: #2563eb; color: white; padding: 12px; border-radius: 12px; font-weight: bold; font-size: 20px; letter-spacing: 0.5px;">Luminous Skill Development Training Center</div>
          </div>
          <h2 style="color: #0f172a; font-size: 20px; font-weight: bold; margin-bottom: 15px;">Enrollment Update</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">Hello <strong>${details.firstName} ${details.lastName}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">Your enrollment status for the course <strong>${details.courseTitle}</strong> has been updated.</p>
          
          <div style="background-color: ${isApproved ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${isApproved ? '#bbf7d0' : '#fecaca'}; padding: 15px; border-radius: 12px; margin: 20px 0; color: ${isApproved ? '#166534' : '#991b1b'};">
            <p style="margin: 0; font-size: 15px; font-weight: bold;">
              Status: ${isApproved ? 'Approved & Admitted 🎉' : 'Declined / Rejected'}
            </p>
            ${enrollmentRequest.admin_note ? `<p style="margin: 10px 0 0 0; font-size: 13px; color: #475569;"><strong>Admin Remark:</strong> ${enrollmentRequest.admin_note}</p>` : ''}
          </div>
          
          ${isApproved ? `
            <p style="font-size: 14px; line-height: 1.6; color: #475569;">You can now view your course on your student portal dashboard.</p>
            <div style="text-align: center; margin: 25px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/student/my-courses" style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 12px; font-weight: bold; font-size: 14px; text-decoration: none; display: inline-block;">
                Go to My Courses
              </a>
            </div>
          ` : `
            <p style="font-size: 14px; line-height: 1.6; color: #475569;">If you have any queries about this enrollment status, feel free to contact the training center administration.</p>
          `}
          
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 25px 0;" />
          <p style="font-size: 11px; text-align: center; color: #94a3b8; margin: 0;">
            Luminous Skill Development Training Center.
          </p>
        </div>
      `;

      if (details.email) {
        sendEmail({
          to: details.email,
          subject: emailSubject,
          html: statusHtml
        }).catch(err => console.error('[ENHANCED-ENROLLMENT-STATUS-EMAIL] Error sending status email:', err));
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
