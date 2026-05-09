import { NextResponse } from 'next/server';

/**
 * Legacy fake “confirm” endpoint removed — payment completes via bKash redirect →
 * GET /api/student/payment/bkash/callback (execute + enroll).
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        'This endpoint is disabled. Complete payment on the bKash page; you will return to this site automatically.'
    },
    { status: 410 }
  );
}
