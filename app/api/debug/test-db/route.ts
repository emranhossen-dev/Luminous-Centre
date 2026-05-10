import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test basic database connection
    const { Pool } = require('pg');
    
    const pool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'postgres',
      password: process.env.DB_PASSWORD || '',
      port: parseInt(process.env.DB_PORT || '5432'),
      ssl: false,
    });

    console.log('Testing database connection with config:', {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      port: process.env.DB_PORT
    });

    const result = await pool.query('SELECT NOW() as current_time, version() as version');
    
    // Check if tables exist
    const tablesQuery = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    // Check if enrollment table exists and its structure
    let enrollmentTableInfo = null;
    const enrollmentExists = tablesQuery.rows.some(row => row.table_name === 'course_enrollment_requests');
    
    if (enrollmentExists) {
      const columnsQuery = await pool.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'course_enrollment_requests' 
        ORDER BY ordinal_position
      `);
      
      const countQuery = await pool.query('SELECT COUNT(*) as count FROM course_enrollment_requests');
      
      enrollmentTableInfo = {
        columns: columnsQuery.rows,
        count: countQuery.rows[0].count
      };
    }

    await pool.end();

    return NextResponse.json({
      success: true,
      databaseTime: result.rows[0].current_time,
      databaseVersion: result.rows[0].version,
      tables: tablesQuery.rows.map(row => row.table_name),
      enrollmentTable: {
        exists: enrollmentExists,
        info: enrollmentTableInfo
      },
      environment: {
        DB_HOST: process.env.DB_HOST || 'NOT SET',
        DB_NAME: process.env.DB_NAME || 'NOT SET',
        DB_USER: process.env.DB_USER || 'NOT SET',
        DB_PORT: process.env.DB_PORT || 'NOT SET',
        NODE_ENV: process.env.NODE_ENV || 'NOT SET'
      }
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack,
      environment: {
        DB_HOST: process.env.DB_HOST || 'NOT SET',
        DB_NAME: process.env.DB_NAME || 'NOT SET',
        DB_USER: process.env.DB_USER || 'NOT SET',
        DB_PORT: process.env.DB_PORT || 'NOT SET'
      }
    }, { status: 500 });
  }
}
