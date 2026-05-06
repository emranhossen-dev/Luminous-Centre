import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { hashPassword, generateToken, generateRefreshToken, logActivity } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone, role = 'student' } = await req.json();

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, password, first name, and last name are required' },
        { status: 400 }
      );
    }

    // Ensure tables exist
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS roles (
          id SERIAL PRIMARY KEY,
          name VARCHAR(50) UNIQUE NOT NULL,
          description TEXT,
          permissions JSONB NOT NULL DEFAULT '[]',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await query(`
        INSERT INTO roles (name, description, permissions) VALUES
        ('admin', 'System administrator with full access', '["*"]'),
        ('employee', 'Employee with course management access', '["courses.create", "courses.read", "courses.update", "courses.delete", "students.read", "grades.read"]'),
        ('mentor', 'Mentor with teaching and student management access', '["courses.read", "students.create", "students.read", "students.update", "grades.create", "grades.read", "grades.update"]'),
        ('student', 'Student with learning access', '["courses.read", "enrollments.create", "enrollments.read", "progress.read"]')
        ON CONFLICT (name) DO NOTHING;
      `);

      await query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255),
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          phone VARCHAR(20),
          role_id INTEGER REFERENCES roles(id) NOT NULL,
          is_active BOOLEAN DEFAULT true,
          email_verified BOOLEAN DEFAULT false,
          last_login TIMESTAMP,
          google_id VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (tableError) {
      console.error('Error creating tables:', tableError);
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Get role ID
    const roleResult = await query(
      'SELECT id FROM roles WHERE name = $1',
      [role]
    );

    if (roleResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    const roleId = roleResult.rows[0].id;

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await query(`
      INSERT INTO users (email, password_hash, first_name, last_name, phone, role_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, first_name, last_name, phone, role_id, created_at
    `, [email, passwordHash, firstName, lastName, phone, roleId]);

    const newUser = result.rows[0];

    // Get user with role and permissions
    const userResult = await query(`
      SELECT 
        u.id,
        u.email,
        u.first_name as "firstName",
        u.last_name as "lastName",
        u.phone,
        u.role_id as "roleId",
        u.is_active as "isActive",
        u.email_verified as "emailVerified",
        u.created_at as "createdAt",
        r.name as "roleName",
        r.permissions
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1
    `, [newUser.id]);

    const user = userResult.rows[0];

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Log activity
    await logActivity(
      newUser.id,
      'user.register',
      'user',
      newUser.id,
      { email, role },
      undefined, // IP address will be handled by middleware
      req.headers.get('user-agent') || undefined
    );

    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        roleName: user.roleName,
        permissions: user.permissions,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt
      },
      token,
      refreshToken
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
