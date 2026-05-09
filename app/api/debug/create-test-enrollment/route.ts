import { NextRequest, NextResponse } from 'next/server';
import { ensurePaymentSchema } from '@/lib/enrollment';
import { query } from '@/lib/database';

export async function POST(req: NextRequest) {
  try {
    await ensurePaymentSchema();

    // First check if we have any users
    const users = await query('SELECT id, first_name, last_name, email, phone FROM users LIMIT 1');
    
    if (users.rows.length === 0) {
      return NextResponse.json({ error: 'No users found in database' }, { status: 400 });
    }

    // Check if we have any courses
    const courses = await query('SELECT id, title, price, currency FROM courses LIMIT 1');
    
    if (courses.rows.length === 0) {
      return NextResponse.json({ error: 'No courses found in database' }, { status: 400 });
    }

    const user = users.rows[0];
    const course = courses.rows[0];

    // Create a test manual enrollment request
    const result = await query(`
      INSERT INTO course_enrollment_requests
        (user_id, course_id, payment_method, payment_status, enrollment_status, amount, currency, payer_name, payer_mobile, payment_mobile, payment_mobile_last3, transaction_id)
       VALUES
        ($1, $2, 'manual', 'pending', 'pending', $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        user.id, 
        course.id, 
        course.price || 0, 
        course.currency || 'BDT', 
        'Test Payer', 
        '01712345678', 
        '01898765432', 
        '432', 
        'TEST_TXN_123456'
      ]
    );

    return NextResponse.json({
      message: 'Test manual enrollment created successfully',
      requestId: result.rows[0].id,
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        phone: user.phone
      },
      course: {
        id: course.id,
        title: course.title,
        price: course.price
      }
    });
  } catch (error) {
    console.error('Create test enrollment error:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
