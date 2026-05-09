import { NextRequest, NextResponse } from 'next/server';
import { ensurePaymentSchema } from '@/lib/enrollment';
import { query } from '@/lib/database';
import { withAdminAuth } from '@/lib/admin-auth';

async function handler(req: NextRequest) {
  try {
    await ensurePaymentSchema();

    // Check if phone field exists in users table
    const phoneCheck = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'phone'
    `);
    
    console.log('Phone field exists:', phoneCheck.rows.length > 0);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const values: (string | number)[] = [];
    let whereClause = '';

    if (status) {
      values.push(status);
      whereClause = 'WHERE cer.enrollment_status = $1';
    }

    const requests = await query(
      `SELECT
        cer.id,
        cer.user_id,
        cer.course_id,
        cer.payment_method,
        cer.payment_status,
        cer.enrollment_status,
        cer.amount,
        cer.currency,
        cer.payer_name,
        cer.payer_mobile,
        cer.payment_mobile,
        cer.payment_mobile_last3,
        cer.transaction_id,
        cer.created_at,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        c.title AS course_title
      FROM course_enrollment_requests cer
      JOIN users u ON u.id = cer.user_id
      JOIN courses c ON c.id = cer.course_id
      ${whereClause}
      ORDER BY cer.created_at DESC
      LIMIT 100`,
      values
    );

    console.log('Total requests found:', requests.rows.length);
    console.log('Sample request data:', requests.rows[0] ? {
      id: requests.rows[0].id,
      payment_method: requests.rows[0].payment_method,
      has_phone: !!requests.rows[0].phone,
      phone_value: requests.rows[0].phone,
      has_payer_name: !!requests.rows[0].payer_name,
      payer_name: requests.rows[0].payer_name
    } : 'No requests');
    
    return NextResponse.json({ requests: requests.rows });
  } catch (error) {
    console.error('Get enrollment requests error:', error);
    return NextResponse.json({ error: 'Failed to fetch enrollment requests' }, { status: 500 });
  }
}

export const GET = withAdminAuth(handler);
