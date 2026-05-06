import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { query } from '@/lib/database';

// GET /api/admin/stats - Get admin dashboard statistics
export async function GET(req: NextRequest, context: { params: Promise<{}> }) {
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
    // Get total users
    const totalUsersResult = await query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(totalUsersResult.rows[0].count);

    // Get total courses
    const totalCoursesResult = await query('SELECT COUNT(*) as count FROM courses');
    const totalCourses = parseInt(totalCoursesResult.rows[0].count);

    // Get total enrollments
    const totalEnrollmentsResult = await query('SELECT COUNT(*) as count FROM enrollments');
    const totalEnrollments = parseInt(totalEnrollmentsResult.rows[0].count);

    // Get total revenue (sum of course prices for paid enrollments)
    const revenueResult = await query(
      'SELECT COALESCE(SUM(c.price), 0) as revenue FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE c.price > 0'
    );
    const totalRevenue = parseFloat(revenueResult.rows[0].revenue);

    // Get active users (logged in within last 30 days)
    const activeUsersResult = await query(
      'SELECT COUNT(*) as count FROM users WHERE last_login >= NOW() - INTERVAL \'30 days\' AND is_active = true'
    );
    const activeUsers = parseInt(activeUsersResult.rows[0].count);

    // Get new users (registered in last 30 days)
    const newUsersResult = await query(
      'SELECT COUNT(*) as count FROM users WHERE created_at >= NOW() - INTERVAL \'30 days\''
    );
    const newUsers = parseInt(newUsersResult.rows[0].count);

    // Get users by role
    const usersByRoleResult = await query(
      'SELECT r.name, COUNT(u.id) as count FROM roles r LEFT JOIN users u ON r.id = u.role_id GROUP BY r.name ORDER BY count DESC'
    );

    // Get courses by status
    const coursesByStatusResult = await query(
      'SELECT status, COUNT(*) as count FROM courses GROUP BY status ORDER BY count DESC'
    );

    // Get recent enrollments (last 7 days)
    const recentEnrollmentsResult = await query(
      'SELECT COUNT(*) as count FROM enrollments WHERE enrollment_date >= NOW() - INTERVAL \'7 days\''
    );
    const recentEnrollments = parseInt(recentEnrollmentsResult.rows[0].count);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalRevenue,
        activeUsers,
        newUsers,
        recentEnrollments
      },
      charts: {
        usersByRole: usersByRoleResult.rows,
        coursesByStatus: coursesByStatusResult.rows
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
