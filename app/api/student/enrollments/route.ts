import { NextRequest, NextResponse } from 'next/server';
import { getUserById, verifyToken } from '@/lib/auth';
import { detectEnrollmentUserColumn } from '@/lib/enrollment';
import { query } from '@/lib/database';

export async function GET(req: NextRequest) {
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

    const userColumn = await detectEnrollmentUserColumn();
    const rows = await query(
      `SELECT
        e.id,
        e.enrollment_date,
        e.completion_percentage,
        c.id AS course_id,
        c.title,
        c.slug,
        c.thumbnail_url,
        c.category
      FROM enrollments e
      JOIN courses c ON c.id = e.course_id
      WHERE e.${userColumn} = $1
      ORDER BY e.enrollment_date DESC`,
      [user.id]
    );

    return NextResponse.json({
      enrollments: rows.rows.map((item: any) => ({
        id: item.course_id,
        title: item.title,
        slug: item.slug,
        thumbnailUrl: item.thumbnail_url,
        category: item.category,
        progress: Number(item.completion_percentage || 0),
        enrolledAt: item.enrollment_date,
        totalModules: 0,
        completedModules: 0
      }))
    });
  } catch (error) {
    console.error('Get student enrollments error:', error);
    return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 });
  }
}
