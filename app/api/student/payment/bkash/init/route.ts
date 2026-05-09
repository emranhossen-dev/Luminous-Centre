import { NextRequest, NextResponse } from 'next/server';
import { getUserById, logActivity, verifyToken } from '@/lib/auth';
import { getPublicBaseUrl } from '@/lib/app-url';
import { bkashCreatePayment } from '@/lib/bkash-checkout';
import { ensurePaymentSchema } from '@/lib/enrollment';
import { query } from '@/lib/database';

function formatAmount(price: unknown): string {
  const n = Number(price);
  if (!Number.isFinite(n) || n < 0) return '0.00';
  return n.toFixed(2);
}

function safeInvoice(courseId: number, userId: number): string {
  const raw = `LC${courseId}U${userId}T${Date.now()}`;
  return raw.replace(/[^a-zA-Z0-9]/g, '').slice(0, 255);
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

    const { courseId } = await req.json();
    const cid = Number(courseId);
    if (!courseId || Number.isNaN(cid)) {
      return NextResponse.json({ error: 'Invalid course' }, { status: 400 });
    }

    await ensurePaymentSchema();

    const courseResult = await query('SELECT id, price, currency FROM courses WHERE id = $1', [cid]);
    if (courseResult.rows.length === 0) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const course = courseResult.rows[0] as { id: number; price: string | number; currency: string };

    if (Number(course.price) <= 0) {
      return NextResponse.json(
        { error: 'This course has no paid price. bKash is only for paid amounts.' },
        { status: 400 }
      );
    }

    const existingApproved = await query(
      `SELECT id FROM course_enrollment_requests
       WHERE user_id = $1 AND course_id = $2 AND enrollment_status IN ('approved', 'active')
       LIMIT 1`,
      [user.id, cid]
    );
    if (existingApproved.rows.length > 0) {
      return NextResponse.json({ error: 'Already enrolled in this course' }, { status: 409 });
    }

    const baseUrl = getPublicBaseUrl(req);
    const callbackURL = `${baseUrl}/api/student/payment/bkash/callback`;

    const payerReferenceRaw =
      (user.phone && String(user.phone).replace(/\s/g, '')) ||
      process.env.BKASH_SANDBOX_PAYER_MSISDN ||
      '01770618575';
    const payerReference = payerReferenceRaw.replace(/[<>&]/g, '').slice(0, 255);

    const amount = formatAmount(course.price);
    const merchantInvoiceNumber = safeInvoice(cid, user.id);

    await query(
      `DELETE FROM course_enrollment_requests
       WHERE user_id = $1 AND course_id = $2 AND enrollment_status = 'pending' AND payment_method = 'bkash'`,
      [user.id, cid]
    );

    const created = await bkashCreatePayment({
      amount,
      merchantInvoiceNumber,
      payerReference,
      callbackURL
    });

    await query(
      `INSERT INTO course_enrollment_requests
        (user_id, course_id, payment_method, payment_status, enrollment_status, amount, currency, bkash_payment_id, gateway_response)
       VALUES ($1, $2, 'bkash', 'pending', 'pending', $3, $4, $5, $6::jsonb)`,
      [
        user.id,
        cid,
        course.price ?? 0,
        course.currency || 'BDT',
        created.paymentID,
        JSON.stringify({ step: 'create', ...created.raw })
      ]
    );

    await logActivity(user.id, 'payment.bkash.init', 'course', cid, {
      paymentID: created.paymentID,
      invoice: merchantInvoiceNumber
    });

    return NextResponse.json({
      bkashURL: created.bkashURL,
      paymentID: created.paymentID
    });
  } catch (error: unknown) {
    console.error('bKash init error:', error);
    const message = error instanceof Error ? error.message : 'Failed to start bKash payment';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
