import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { withAdminAuth } from '@/lib/admin-auth';
import { detectEnrollmentUserColumn, createEnrollmentIfMissing } from '@/lib/enrollment';
import { logActivity } from '@/lib/auth';

// GET /api/admin/enrollments - List all enrollments
async function getHandler(req: NextRequest) {
  try {
    const userColumn = await detectEnrollmentUserColumn();
    const result = await query(
      `SELECT
        e.id AS enrollment_id,
        e.enrollment_date,
        e.status AS enrollment_status,
        e.completion_percentage,
        u.id AS user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        c.id AS course_id,
        c.title AS course_title,
        c.slug AS course_slug
      FROM enrollments e
      JOIN users u ON u.id = e.${userColumn}
      JOIN courses c ON c.id = e.course_id
      ORDER BY e.enrollment_date DESC
      LIMIT 500`,
      []
    );

    return NextResponse.json({ enrollments: result.rows });
  } catch (error) {
    console.error('Admin enrollments list error:', error);
    return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 });
  }
}

// POST /api/admin/enrollments - Direct Course Assignment (Admin enrolls student manually)
async function postHandler(req: NextRequest, context: any, adminUser: any) {
  try {
    const { userId, courseId, amount, paymentMethod } = await req.json();

    if (!userId || !courseId) {
      return NextResponse.json({ error: 'User ID and Course ID are required' }, { status: 400 });
    }

    // 1. Fetch user details
    const userRes = await query(
      'SELECT id, email, first_name, last_name, phone FROM users WHERE id = $1',
      [userId]
    );
    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: 'Selected student user not found' }, { status: 404 });
    }
    const studentUser = userRes.rows[0];

    // 2. Fetch course details
    const courseRes = await query(
      'SELECT id, title, category, price, batch FROM courses WHERE id = $1',
      [courseId]
    );
    if (courseRes.rows.length === 0) {
      return NextResponse.json({ error: 'Selected course not found' }, { status: 404 });
    }
    const course = courseRes.rows[0];

    // 3. Check if already enrolled in enrollments table
    const userColumn = await detectEnrollmentUserColumn();
    const existing = await query(
      `SELECT id FROM enrollments WHERE ${userColumn} = $1 AND course_id = $2`,
      [userId, courseId]
    );
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Student is already enrolled in this course' }, { status: 409 });
    }

    const payAmount = amount !== undefined ? parseFloat(amount) : (course.price || 0);
    const payMethod = paymentMethod || 'cash';

    // 4. Insert enrollment log record in course_enrollment_requests
    const requestResult = await query(
      `INSERT INTO course_enrollment_requests (
        user_id, course_id, payment_method, payment_status, enrollment_status,
        amount, currency, payer_name, payer_mobile, payment_mobile,
        transaction_id, full_name, mobile_number, email, course_title,
        course_category, course_price, batch_name, admin_note, reviewed_by, reviewed_at
      ) VALUES ($1, $2, $3, 'verified', 'admitted', $4, 'BDT', $5, $6, $7, 'DIRECT-ASSIGN', $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP)
      RETURNING id`,
      [
        userId,
        courseId,
        payMethod,
        payAmount,
        `${studentUser.first_name} ${studentUser.last_name}`,
        studentUser.phone || 'N/A',
        studentUser.phone || 'N/A',
        `${studentUser.first_name} ${studentUser.last_name}`,
        studentUser.phone || 'N/A',
        studentUser.email,
        course.title,
        course.category || 'online',
        course.price || 0,
        course.batch || 'Batch-1',
        'Manually enrolled by Admin.',
        adminUser.userId
      ]
    );

    // 5. Create actual active course enrollment
    await createEnrollmentIfMissing(userId, courseId, payMethod);

    // 6. Log admin activity
    await logActivity(
      adminUser.userId,
      'admin.enrollments.create',
      'course',
      courseId,
      { studentUserId: userId, courseId, amount: payAmount, requestId: requestResult.rows[0]?.id }
    );

    return NextResponse.json({
      success: true,
      message: 'Student enrolled in course successfully! 🚀',
      requestId: requestResult.rows[0]?.id
    });
  } catch (error: any) {
    console.error('Direct enrollment error:', error);
    return NextResponse.json({ error: 'Failed to assign course to student', details: error.message }, { status: 500 });
  }
}

export const GET = withAdminAuth(getHandler);
export const POST = withAdminAuth(postHandler);
