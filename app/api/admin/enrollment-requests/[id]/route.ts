import { NextRequest, NextResponse } from 'next/server';
import { createEnrollmentIfMissing, ensurePaymentSchema } from '@/lib/enrollment';
import { query } from '@/lib/database';
import { withAdminAuth } from '@/lib/admin-auth';

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
      'SELECT id, user_id, course_id FROM course_enrollment_requests WHERE id = $1',
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

    return NextResponse.json({
      message: action === 'approve' ? 'Enrollment request approved' : 'Enrollment request rejected'
    });
  } catch (error) {
    console.error('Update enrollment request error:', error);
    return NextResponse.json({ error: 'Failed to update enrollment request' }, { status: 500 });
  }
}

export const PATCH = withAdminAuth(patchHandler);
