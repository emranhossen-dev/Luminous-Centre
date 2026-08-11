import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { hashPassword, generateToken, generateRefreshToken, logActivity } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

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

    // If role is student, send a welcome email
    if (role === 'student') {
      const welcomeHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); color: #1e293b;">
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="display: inline-block; background-color: #2563eb; color: white; padding: 12px; border-radius: 12px; font-weight: bold; font-size: 20px; letter-spacing: 0.5px;">Luminous Skill Development Training Center</div>
          </div>
          <h2 style="color: #0f172a; font-size: 20px; font-weight: bold; margin-bottom: 15px;">Welcome to Luminous Skill Development Training Center!</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">Hello <strong>${firstName} ${lastName}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">Thank you for registering on our platform! We are thrilled to welcome you to the <strong>Luminous Skill Development Training Center</strong> community.</p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">Your account has been successfully created. You can now log in to enroll in our premium courses, access learning materials, and track your educational progress.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 12px; font-weight: bold; font-size: 14px; text-decoration: none; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
              Login to Your Dashboard
            </a>
          </div>
          
          <p style="font-size: 13px; line-height: 1.6; color: #475569;">
            If you have any questions or require assistance, please feel free to reply to this email or reach out to our student support team.
          </p>
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 25px 0;" />
          <p style="font-size: 11px; text-align: center; color: #94a3b8; margin: 0;">
            Luminous Skill Development Training Center.
          </p>
        </div>
      `;

      sendEmail({
        to: email,
        subject: 'Welcome to Luminous Skill Development Training Center! 🎉',
        html: welcomeHtml
      }).catch(err => console.error('[REGISTER-WELCOME-EMAIL] Error sending welcome email:', err));
    }

    // If role is mentor, insert into mentors table to sync
    if (role === 'mentor') {
      await query(`
        INSERT INTO mentors (name, email, phone, status)
        VALUES ($1, $2, $3, 'active')
        ON CONFLICT (email) DO NOTHING
      `, [`${firstName} ${lastName}`, email.toLowerCase(), phone || null]);
    }
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
