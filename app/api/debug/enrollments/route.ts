import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(req: NextRequest) {
  try {
    // Check if phone field exists in users table
    const phoneCheck = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'phone'
    `);
    
    // Get sample enrollment requests
    const enrollments = await query(`
      SELECT 
        cer.id,
        cer.payment_method,
        cer.payer_name,
        cer.payer_mobile,
        cer.payment_mobile,
        cer.payment_mobile_last3,
        cer.transaction_id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        c.title AS course_title
      FROM course_enrollment_requests cer
      JOIN users u ON u.id = cer.user_id
      JOIN courses c ON c.id = cer.course_id
      ORDER BY cer.created_at DESC
      LIMIT 5
    `);
    
    // Get all manual payment requests
    const manualRequests = await query(`
      SELECT COUNT(*) as count
      FROM course_enrollment_requests 
      WHERE payment_method = 'manual'
    `);
    
    return NextResponse.json({
      phoneFieldExists: phoneCheck.rows.length > 0,
      phoneFieldInfo: phoneCheck.rows,
      sampleEnrollments: enrollments.rows,
      manualRequestCount: manualRequests.rows[0].count,
      totalSampleCount: enrollments.rows.length
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
