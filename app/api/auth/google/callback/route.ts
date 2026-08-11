import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${request.nextUrl.origin}/auth/google-callback?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${request.nextUrl.origin}/auth/google-callback?error=missing_code`);
  }

  try {
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

      // First create users table without google_id
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
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Then add google_id column if it doesn't exist
      try {
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);`);
        await query(`CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);`);
      } catch (alterError) {
        console.log('google_id column already exists or could not be added:', alterError);
      }

      await query(`
        CREATE TABLE IF NOT EXISTS activity_logs (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          action VARCHAR(255) NOT NULL,
          resource_type VARCHAR(100),
          resource_id INTEGER,
          details JSONB,
          ip_address VARCHAR(45),
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (tableError) {
      console.error('Error creating tables:', tableError);
    }
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${request.nextUrl.origin}/api/auth/google/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(tokenData.error_description || 'Failed to exchange code for token');
    }

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const googleUser = await userResponse.json();

    if (!googleUser.email) {
      throw new Error('Failed to get user email from Google');
    }

    // Check if user exists in database
    let user = await query(`
      SELECT 
        u.id,
        u.email,
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
      WHERE u.email = $1 AND u.is_active = true
    `, [googleUser.email]);

    let userData;

    if (user.rows.length === 0) {
      // Create new user with Google data
      const defaultPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(defaultPassword, 12);

      // Try insert with google_id first, then fallback without it
      let newUser;
      try {
        newUser = await query(`
          INSERT INTO users (email, first_name, last_name, password_hash, role_id, is_active, email_verified, google_id)
          VALUES ($1, $2, $3, $4, 4, true, true, $5)
          RETURNING id, email, first_name as "firstName", last_name as "lastName", role_id as "roleId", is_active as "isActive", email_verified as "emailVerified", created_at as "createdAt"
        `, [
          googleUser.email,
          googleUser.given_name || googleUser.name?.split(' ')[0] || 'User',
          googleUser.family_name || googleUser.name?.split(' ')[1] || '',
          hashedPassword,
          googleUser.id
        ]);
      } catch (insertError) {
        // Fallback: insert without google_id if column doesn't exist
        newUser = await query(`
          INSERT INTO users (email, first_name, last_name, password_hash, role_id, is_active, email_verified)
          VALUES ($1, $2, $3, $4, 4, true, true)
          RETURNING id, email, first_name as "firstName", last_name as "lastName", role_id as "roleId", is_active as "isActive", email_verified as "emailVerified", created_at as "createdAt"
        `, [
          googleUser.email,
          googleUser.given_name || googleUser.name?.split(' ')[0] || 'User',
          googleUser.family_name || googleUser.name?.split(' ')[1] || '',
          hashedPassword
        ]);
      }

      userData = newUser.rows[0];

      // Log activity
      await query(`
        INSERT INTO activity_logs (user_id, action, resource_type, details)
        VALUES ($1, 'google_signup', 'user', $2)
      `, [userData.id, JSON.stringify({ googleId: googleUser.id, email: googleUser.email })]);
    } else {
      userData = user.rows[0];

      // Update last login and Google ID if not set
      try {
        await query(`
          UPDATE users 
          SET last_login = CURRENT_TIMESTAMP, google_id = COALESCE(google_id, $1)
          WHERE id = $2
        `, [googleUser.id, userData.id]);
      } catch (updateError) {
        // Fallback: update only last_login if google_id column doesn't exist
        await query(`
          UPDATE users 
          SET last_login = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [userData.id]);
      }

      // Log activity
      await query(`
        INSERT INTO activity_logs (user_id, action, resource_type, details)
        VALUES ($1, 'google_login', 'user', $2)
      `, [userData.id, JSON.stringify({ googleId: googleUser.id, email: googleUser.email })]);
    }

    // Get role information
    const roleInfo = await query(`
      SELECT name as "roleName", permissions FROM roles WHERE id = $1
    `, [userData.roleId]);

    const userWithRole = {
      ...userData,
      roleName: roleInfo.rows[0].roleName,
      permissions: roleInfo.rows[0].permissions || []
    };

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: userWithRole.id,
        email: userWithRole.email,
        roleId: userWithRole.roleId,
        roleName: userWithRole.roleName,
        permissions: userWithRole.permissions,
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as SignOptions
    );

    // Redirect to frontend with token
    const redirectUrl = new URL('/auth/google-callback', request.nextUrl.origin);
    redirectUrl.searchParams.set('token', token);
    redirectUrl.searchParams.set('user', JSON.stringify(userWithRole));

    return NextResponse.redirect(redirectUrl.toString());

  } catch (error: any) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(
      `${request.nextUrl.origin}/auth/google-callback?error=${encodeURIComponent(error.message || 'Authentication failed')}`
    );
  }
}
