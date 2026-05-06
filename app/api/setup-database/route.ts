import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST() {
  try {
    // Create roles table
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

    // Insert default roles
    await query(`
      INSERT INTO roles (name, description, permissions) VALUES
      ('admin', 'System administrator with full access', '["*"]'),
      ('employee', 'Employee with course management access', '["courses.create", "courses.read", "courses.update", "courses.delete", "students.read", "grades.read"]'),
      ('mentor', 'Mentor with teaching and student management access', '["courses.read", "students.create", "students.read", "students.update", "grades.create", "grades.read", "grades.update"]'),
      ('student', 'Student with learning access', '["courses.read", "enrollments.create", "enrollments.read", "progress.read"]')
      ON CONFLICT (name) DO NOTHING;
    `);

    // Create default admin user
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 12);
    
    await query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role_id, is_active, email_verified)
      VALUES ('admin@luminous.com', $1, 'Admin', 'User', 1, true, true)
      ON CONFLICT (email) DO NOTHING
    `, [adminPassword]);

    // Create users table
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

    // Create courses table
    await query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        short_description TEXT,
        category VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) DEFAULT 0,
        old_price DECIMAL(10, 2),
        currency VARCHAR(3) DEFAULT 'BDT',
        language VARCHAR(50) DEFAULT 'bangla',
        level VARCHAR(50) DEFAULT 'beginner',
        duration_weeks INTEGER,
        total_hours INTEGER,
        thumbnail_url VARCHAR(500),
        preview_video_url VARCHAR(500),
        status VARCHAR(20) DEFAULT 'draft',
        featured BOOLEAN DEFAULT false,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create enrollments table
    await query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES users(id),
        course_id INTEGER REFERENCES courses(id),
        enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active',
        completion_percentage DECIMAL(5, 2) DEFAULT 0,
        last_accessed TIMESTAMP,
        UNIQUE(student_id, course_id)
      );
    `);

    // Create activity_logs table
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

    // Create indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);`);

    return NextResponse.json({
      success: true,
      message: 'Database tables created successfully',
      tables: ['roles', 'users', 'courses', 'enrollments', 'activity_logs']
    });
  } catch (error: any) {
    console.error('Database setup error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
