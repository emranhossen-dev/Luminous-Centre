import { query } from '@/lib/database';
import { bkashExecutePayment } from '@/lib/bkash-checkout';
import { createEnrollmentIfMissing, ensurePaymentSchema } from '@/lib/enrollment';

export type FinalizeBkashResult =
  | { ok: true; reason: 'completed' | 'already_completed'; userId: number }
  | { ok: false; reason: string };

/**
 * After bKash redirects back with status=success, call execute and mark enrollment paid.
 */
export async function finalizeBkashAfterRedirect(paymentID: string): Promise<FinalizeBkashResult> {
  console.log('Starting bKash finalization for paymentID:', paymentID);
  await ensurePaymentSchema();

  const pending = await query(
    `SELECT id, user_id, course_id
     FROM course_enrollment_requests
     WHERE bkash_payment_id = $1 AND payment_method = 'bkash' AND enrollment_status = 'pending'
     LIMIT 1`,
    [paymentID]
  );

  console.log('Pending payment requests found:', pending.rows.length);

  if (pending.rows.length === 0) {
    const done = await query(
      `SELECT user_id, course_id FROM course_enrollment_requests
       WHERE bkash_payment_id = $1 AND enrollment_status IN ('approved', 'active')
       LIMIT 1`,
      [paymentID]
    );
    if (done.rows.length > 0) {
      const row = done.rows[0] as { user_id: number; course_id: number };
      await createEnrollmentIfMissing(row.user_id, row.course_id);
      return { ok: true, reason: 'already_completed', userId: row.user_id };
    }
    return { ok: false, reason: 'payment_session_not_found' };
  }

  const rec = pending.rows[0] as { id: number; user_id: number; course_id: number };

  console.log('Executing bKash payment for paymentID:', paymentID);
  const exec = await bkashExecutePayment(paymentID);
  console.log('bKash execution response:', JSON.stringify(exec, null, 2));
  
  const statusCode = exec.statusCode as string | undefined;
  const trxID = exec.trxID as string | undefined;
  const transactionStatus = exec.transactionStatus as string | undefined;

  console.log('Parsed response:', { statusCode, trxID, transactionStatus });

  if (statusCode === '0000' && transactionStatus === 'Completed' && trxID) {
    await query(
      `UPDATE course_enrollment_requests
       SET payment_status = 'paid',
           enrollment_status = 'approved',
           transaction_id = $1,
           gateway_response = $2::jsonb,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [trxID, JSON.stringify(exec), rec.id]
    );
    await createEnrollmentIfMissing(rec.user_id, rec.course_id);
    return { ok: true, reason: 'completed', userId: rec.user_id };
  }

  await query(
    `UPDATE course_enrollment_requests
     SET payment_status = 'failed',
         enrollment_status = 'rejected',
         gateway_response = $1::jsonb,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
    [JSON.stringify(exec), rec.id]
  );

  const msg =
    (exec.statusMessage as string) ||
    (exec.errorMessage as string) ||
    'execute_failed';
  
  console.log('bKash execution failed, reason:', msg);
  console.log('Full execution response:', JSON.stringify(exec, null, 2));
  
  return { ok: false, reason: msg };
}
