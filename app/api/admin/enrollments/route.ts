import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { withAdminAuth } from '@/lib/admin-auth';
import { detectEnrollmentUserColumn } from '@/lib/enrollment';

async function handler(req: NextRequest) {
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

export const GET = withAdminAuth(handler);
