import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyPassword, generateToken, generateRefreshToken, updateLastLogin, logActivity } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get user with role and permissions
    const userResult = await query(`
      SELECT 
        u.id,
        u.email,
        u.password_hash as "passwordHash",
        u.first_name as "firstName",
        u.last_name as "lastName",
        u.phone,
        u.role_id as "roleId",
        u.is_active as "isActive",
        u.email_verified as "emailVerified",
        u.last_login as "lastLogin",
        u.created_at as "createdAt",
        r.name as "roleName",
        r.permissions
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.email = $1
    `, [email]);

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = userResult.rows[0];

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login
    await updateLastLogin(user.id);

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Log activity
    await logActivity(
      user.id,
      'user.login',
      'user',
      user.id,
      { email },
      undefined,
      req.headers.get('user-agent') || undefined
    );

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        roleName: user.roleName,
        permissions: user.permissions,
        emailVerified: user.emailVerified,
        lastLogin: new Date(),
        createdAt: user.createdAt
      },
      token,
      refreshToken
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
