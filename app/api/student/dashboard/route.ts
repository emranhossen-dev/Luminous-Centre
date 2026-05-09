import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { query } from '@/lib/database';

// GET /api/student/dashboard - Get student dashboard data
export async function GET(req: NextRequest) {
  try {
    // Authentication
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

    // Get enrollment statistics
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_courses,
        COUNT(CASE WHEN e.status = 'completed' THEN 1 END) as completed_courses,
        COUNT(CASE WHEN e.status = 'active' THEN 1 END) as in_progress_courses,
        COALESCE(SUM(c.total_hours), 0) as total_hours,
        COUNT(CASE WHEN e.status = 'completed' THEN 1 END) as certificates
      FROM enrollments e
      LEFT JOIN courses c ON e.course_id = c.id
      WHERE e.user_id = $1
    `, [user.id]);

    // Get enrolled courses with progress
    const coursesResult = await query(`
      SELECT 
        e.id as enrollment_id,
        e.status as enrollment_status,
        e.progress,
        e.enrolled_at,
        c.id,
        c.title,
        c.slug,
        c.description,
        c.category,
        c.price,
        c.thumbnail_url,
        c.total_hours,
        c.duration_weeks,
        c.level
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.user_id = $1
      ORDER BY e.enrolled_at DESC
      LIMIT 5
    `, [user.id]);

    const stats = statsResult.rows[0] || {
      total_courses: 0,
      completed_courses: 0,
      in_progress_courses: 0,
      total_hours: 0,
      certificates: 0
    };

    return NextResponse.json({
      totalCourses: parseInt(stats.total_courses) || 0,
      completedCourses: parseInt(stats.completed_courses) || 0,
      inProgressCourses: parseInt(stats.in_progress_courses) || 0,
      totalHours: parseInt(stats.total_hours) || 0,
      certificates: parseInt(stats.certificates) || 0,
      enrolledCourses: coursesResult.rows.map(course => ({
        ...course,
        progress: parseInt(course.progress) || 0,
        enrolled_at: course.enrolled_at
      }))
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
