import { NextRequest, NextResponse } from 'next/server';
import { getPublicBaseUrl } from '@/lib/app-url';
import { finalizeBkashAfterRedirect } from '@/lib/bkash-enroll';

/**
 * bKash redirects the customer's browser here (success / failure / cancel).
 * We only finalize when status indicates success; then we execute the payment server-side.
 */
export async function GET(req: NextRequest) {
  const base = getPublicBaseUrl(req);
  const url = req.nextUrl;
  const paymentID =
    url.searchParams.get('paymentID') ||
    url.searchParams.get('paymentId') ||
    url.searchParams.get('payment_id');
  const status = (url.searchParams.get('status') || '').toLowerCase();

  console.log('bKash callback received:', { paymentID, status });

  if (!paymentID) {
    console.log('Missing paymentID in callback');
    return NextResponse.redirect(new URL('/payment/bkash/failed?reason=missing_payment_id', base));
  }

  if (status !== 'success') {
    console.log('Payment status not success:', status);
    const q = new URLSearchParams({
      reason: status || 'not_success',
      paymentID
    });
    return NextResponse.redirect(new URL(`/payment/bkash/failed?${q}`, base));
  }

  try {
    console.log('Calling finalizeBkashAfterRedirect...');
    const result = await finalizeBkashAfterRedirect(paymentID);
    console.log('Finalize result:', result);
    
    if (result.ok) {
      console.log('Payment finalized successfully, redirecting to success page');
      return NextResponse.redirect(new URL('/student?payment=success', base));
    }
    
    console.log('Payment finalization failed, reason:', result.reason);
    return NextResponse.redirect(
      new URL(`/payment/bkash/failed?reason=${encodeURIComponent(result.reason)}`, base)
    );
  } catch (e) {
    console.error('bKash callback finalize error:', e);
    console.error('Error details:', {
      message: e instanceof Error ? e.message : 'Unknown error',
      stack: e instanceof Error ? e.stack : undefined
    });
    return NextResponse.redirect(
      new URL('/payment/bkash/failed?reason=finalize_error', base)
    );
  }
}
