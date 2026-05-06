import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { query } from '@/lib/database';
import { logActivity } from '@/lib/auth';

// GET /api/admin/users - Get all users with pagination
const getUsers = withAuth(async (req: NextRequest, context: any, user: any) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const role = searchParams.get('role');

    let whereClause = 'WHERE 1=1';
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (u.first_name ILIKE $${paramIndex++} OR u.last_name ILIKE $${paramIndex++} OR u.email ILIKE $${paramIndex++})`;
      queryParams.push(search, search, search);
    }

    if (role) {
      whereClause += ` AND r.name = $${paramIndex++}`;
      queryParams.push(role);
    }

    const offset = (page - 1) * limit;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ${whereClause}
    `;

    const usersQuery = `
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.is_active,
        u.email_verified,
        u.last_login,
        u.created_at,
        r.name as role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const countResult = await query(countQuery, queryParams);
    
    queryParams.push(limit, offset);
    const usersResult = await query(usersQuery, queryParams);

    const total = parseInt(countResult.rows[0].total);
    const users = usersResult.rows;

    // Log activity
    await logActivity(
      user.id,
      'admin.users.read',
      'user',
      null,
      { search, role, page, limit }
    );

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
});

// PUT /api/admin/users/[id]/toggle-status - Toggle user active status
const toggleUserStatus = withAuth(async (req: NextRequest, context: any, user: any) => {
  try {
    const { id } = context.params;
    const { isActive } = await req.json();

    await query(
      'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [isActive, id]
    );

    // Log activity
    await logActivity(
      user.id,
      'admin.users.update',
      'user',
      id,
      { isActive }
    );

    return NextResponse.json({
      message: 'User status updated successfully'
    });

  } catch (error) {
    console.error('Toggle user status error:', error);
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    );
  }
});

// DELETE /api/admin/users/[id] - Delete user
const deleteUser = withAuth(async (req: NextRequest, context: any, user: any) => {
  try {
    const { id } = context.params;

    // Check if user exists
    const userResult = await query('SELECT id, email, first_name, last_name FROM users WHERE id = $1', [id]);
    
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has enrollments
    const enrollmentCheck = await query(
      'SELECT COUNT(*) as count FROM enrollments WHERE user_id = $1',
      [id]
    );

    if (parseInt(enrollmentCheck.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'Cannot delete user with active enrollments' },
        { status: 400 }
      );
    }

    // Delete user (cascade will handle related records)
    await query('DELETE FROM users WHERE id = $1', [id]);

    // Log activity
    await logActivity(
      user.id,
      'admin.users.delete',
      'user',
      id
    );

    return NextResponse.json({
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
});

export const GET = getUsers;
export const PUT = toggleUserStatus;
export const DELETE = deleteUser;
