import { NextRequest, NextResponse } from 'next/server';
import { createEnrollmentIfMissing, ensurePaymentSchema } from '@/lib/enrollment';
import { query } from '@/lib/database';
import { withAdminAuth } from '@/lib/admin-auth';
import { sendEmail } from '@/lib/email';

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
      `SELECT r.id, r.user_id, r.course_id, u.email, u.first_name as "firstName", u.last_name as "lastName", c.title as "courseTitle"
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
      await createEnrollmentIfMissing(request.user_id, request.course_id);
    }

    // Send email to student notifying about enrollment request status change
    const emailSubject = action === 'approve' 
      ? 'Course Enrollment Request Approved! - Luminous Skills' 
      : 'Course Enrollment Request Status - Luminous Skills';

    const statusHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); color: #1e293b;">
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="display: inline-block; background-color: #2563eb; color: white; padding: 12px; border-radius: 12px; font-weight: bold; font-size: 20px; letter-spacing: 0.5px;">Luminous Skill Development Training Center</div>
        </div>
        <h2 style="color: #0f172a; font-size: 20px; font-weight: bold; margin-bottom: 15px;">Enrollment Request Update</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">Hello <strong>${request.firstName} ${request.lastName}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">We have reviewed your enrollment request for the course: <strong>${request.courseTitle}</strong>.</p>
        
        <div style="background-color: ${action === 'approve' ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${action === 'approve' ? '#bbf7d0' : '#fecaca'}; padding: 15px; border-radius: 12px; margin: 20px 0; color: ${action === 'approve' ? '#166534' : '#991b1b'};">
          <p style="margin: 0; font-size: 15px; font-weight: bold;">
            Status: ${action === 'approve' ? 'Approved & Admitted 🎉' : 'Declined / Rejected'}
          </p>
          ${note ? `<p style="margin: 10px 0 0 0; font-size: 13px; color: #475569;"><strong>Admin Remark:</strong> ${note}</p>` : ''}
        </div>
        
        ${action === 'approve' ? `
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">You are now enrolled in the course. You can access your learning portal, courses, and resources directly from your dashboard.</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/student/my-courses" style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 12px; font-weight: bold; font-size: 14px; text-decoration: none; display: inline-block;">
              Go to My Courses
            </a>
          </div>
        ` : `
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">If you think this was a mistake or have questions regarding your payment verification, please reply to this email or contact support.</p>
        `}
        
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 25px 0;" />
        <p style="font-size: 11px; text-align: center; color: #94a3b8; margin: 0;">
          Luminous Skill Development Training Center.
        </p>
      </div>
    `;

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

export const PATCH = withAdminAuth(patchHandler);
