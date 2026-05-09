import { NextRequest, NextResponse } from 'next/server';
import { getUserById, logActivity, verifyToken } from '@/lib/auth';
import { ensurePaymentSchema } from '@/lib/enrollment';
import { query } from '@/lib/database';

function isValidMobile(value: string) {
  return /^(\+?88)?01[3-9]\d{8}$/.test(value);
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    const user = await getUserById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const body = await req.json();
    const { courseId, payerName, payerMobile, paymentMobile, paymentMobileLast3, transactionId } = body;

    if (!courseId || !payerName || !payerMobile || !paymentMobile || !paymentMobileLast3 || !transactionId) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!isValidMobile(payerMobile) || !isValidMobile(paymentMobile)) {
      return NextResponse.json({ error: 'Invalid mobile number format' }, { status: 400 });
    }

    if (!/^\d{3}$/.test(paymentMobileLast3)) {
      return NextResponse.json({ error: 'Last 3 digits must be numeric' }, { status: 400 });
    }

    await ensurePaymentSchema();

    const courseResult = await query('SELECT id, price, currency FROM courses WHERE id = $1', [courseId]);
    if (courseResult.rows.length === 0) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const existing = await query(
      `SELECT id, enrollment_status
       FROM course_enrollment_requests
       WHERE user_id = $1 AND course_id = $2
       ORDER BY created_at DESC
       LIMIT 1`,
      [user.id, courseId]
    );

    if (existing.rows.length > 0 && ['pending', 'approved', 'active'].includes(existing.rows[0].enrollment_status)) {
      return NextResponse.json(
        { error: 'You already have an enrollment request for this course' },
        { status: 409 }
      );
    }

    const course = courseResult.rows[0];
    const result = await query(
      `INSERT INTO course_enrollment_requests
        (user_id, course_id, payment_method, payment_status, enrollment_status, amount, currency, payer_name, payer_mobile, payment_mobile, payment_mobile_last3, transaction_id)
       VALUES
        ($1, $2, 'manual', 'pending', 'pending', $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [user.id, courseId, course.price ?? 0, course.currency ?? 'BDT', payerName, payerMobile, paymentMobile, paymentMobileLast3, transactionId]
    );

    await logActivity(user.id, 'payment.manual.requested', 'course', courseId, {
      requestId: result.rows[0].id
    });

    return NextResponse.json({
      message: 'Manual payment request submitted successfully. Please wait for admin approval.',
      requestId: result.rows[0].id
    });
  } catch (error) {
    console.error('Manual payment submit error:', error);
    return NextResponse.json({ error: 'Failed to submit manual payment request' }, { status: 500 });
  }
}
