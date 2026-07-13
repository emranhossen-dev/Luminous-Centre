import { NextRequest, NextResponse } from 'next/server';
import { createEnrollmentIfMissing, ensurePaymentSchema, detectEnrollmentUserColumn } from '@/lib/enrollment';
import { query } from '@/lib/database';
import { withAdminAuth } from '@/lib/admin-auth';
import { sendEmail, getEmailTemplate } from '@/lib/email';

async function patchHandler(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
  admin: { userId: number }
) {
  try {
    await ensurePaymentSchema();
    const { id } = await context.params;
    const { action, note } = await req.json();

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const requestResult = await query(
      `SELECT r.id, r.user_id, r.course_id, r.payment_method, u.email, u.first_name as "firstName", u.last_name as "lastName", c.title as "courseTitle"
       FROM course_enrollment_requests r
       JOIN users u ON r.user_id = u.id
       JOIN courses c ON r.course_id = c.id
       WHERE r.id = $1`,
      [id]
    );

    if (requestResult.rows.length === 0) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const request = requestResult.rows[0];
    const enrollmentStatus = action === 'approve' ? 'approved' : 'rejected';
    const paymentStatus = action === 'approve' ? 'paid' : 'failed';

    await query(
      `UPDATE course_enrollment_requests
       SET enrollment_status = $1,
           payment_status = $2,
           admin_note = $3,
           reviewed_by = $4,
           reviewed_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5`,
      [enrollmentStatus, paymentStatus, note || null, admin.userId, id]
    );

    if (action === 'approve') {
      await createEnrollmentIfMissing(request.user_id, request.course_id, request.payment_method || 'manual');
    }

    // Send email to student notifying about enrollment request status change
    const emailSubject = action === 'approve' 
      ? 'Course Enrollment Request Approved! - Luminous Centre' 
      : 'Course Enrollment Request Status - Luminous Centre';

    const statusHtml = getEmailTemplate({
      title: 'Enrollment Request Update - Luminous Centre',
      heading: 'Enrollment Request Update',
      bodyHtml: `
        <p>Hello <strong>${request.firstName} ${request.lastName}</strong>,</p>
        <p>We have reviewed your enrollment request for the course: <strong>${request.courseTitle}</strong>.</p>
        
        <div style="background-color: ${action === 'approve' ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${action === 'approve' ? '#bbf7d0' : '#fecaca'}; padding: 15px; border-radius: 12px; margin: 20px 0; color: ${action === 'approve' ? '#166534' : '#991b1b'};">
          <p style="margin: 0; font-size: 15px; font-weight: bold;">
            Status: ${action === 'approve' ? 'Approved & Admitted 🎉' : 'Declined / Rejected'}
          </p>
          ${note ? `<p style="margin: 10px 0 0 0; font-size: 13px; color: #475569;"><strong>Admin Remark:</strong> ${note}</p>` : ''}
        </div>
        
        ${action === 'approve' ? `
          <p>You are now enrolled in the course. You can access your learning portal, courses, and resources directly from your dashboard.</p>
        ` : `
          <p>If you think this was a mistake or have questions regarding your payment verification, please reply to this email or contact support.</p>
        `}
      `,
      ctaText: action === 'approve' ? 'Go to My Courses' : undefined,
      ctaLink: action === 'approve' ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/student/my-courses` : undefined
    });

    if (request.email) {
      sendEmail({
        to: request.email,
        subject: emailSubject,
        html: statusHtml
      }).catch(err => console.error('[ENROLLMENT-REQUEST-STATUS-EMAIL] Error sending status email:', err));
    }

    return NextResponse.json({
      message: action === 'approve' ? 'Enrollment request approved' : 'Enrollment request rejected'
    });
  } catch (error) {
    console.error('Update enrollment request error:', error);
    return NextResponse.json({ error: 'Failed to update enrollment request' }, { status: 500 });
  }
}

async function deleteHandler(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
  admin: { userId: number }
) {
  try {
    const { id } = await context.params;

    // Fetch user_id and course_id of this request
    const requestResult = await query(
      'SELECT user_id, course_id FROM course_enrollment_requests WHERE id = $1',
      [id]
    );

    if (requestResult.rows.length === 0) {
      return NextResponse.json({ error: 'Enrollment request not found' }, { status: 404 });
    }

    const { user_id, course_id } = requestResult.rows[0];

    // Detect dynamically whether the column is student_id or user_id in enrollments table
    const userColumn = await detectEnrollmentUserColumn();

    // Delete active enrollment if exists
    await query(
      `DELETE FROM enrollments WHERE ${userColumn} = $1 AND course_id = $2`,
      [user_id, course_id]
    );

    // Delete enrollment request
    await query(
      'DELETE FROM course_enrollment_requests WHERE id = $1',
      [id]
    );

    return NextResponse.json({
      success: true,
      message: 'Enrollment request and active enrollment deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete enrollment request error:', error);
    return NextResponse.json({ error: 'Failed to delete enrollment request', details: error.message }, { status: 500 });
  }
}

export const PATCH = withAdminAuth(patchHandler);
export const DELETE = withAdminAuth(deleteHandler);
