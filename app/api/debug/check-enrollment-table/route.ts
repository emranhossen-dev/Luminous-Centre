import { NextResponse } from 'next/server';
import { query, tableExists } from '@/lib/database';

export async function GET() {
  try {
    // Check if tables exist
    const enrollmentTableExists = await tableExists('course_enrollment_requests');
    const seminarTableExists = await tableExists('seminar_applications');
    const usersTableExists = await tableExists('users');
    const coursesTableExists = await tableExists('courses');

    // Check table structures if they exist
    let enrollmentColumns = [];
    let recentEnrollments = [];

    if (enrollmentTableExists) {
      const columnsResult = await query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'course_enrollment_requests' 
        ORDER BY ordinal_position
      `);
      enrollmentColumns = columnsResult.rows;

      const recentResult = await query(`
        SELECT id, user_id, course_id, full_name, payment_screenshot_url, created_at
        FROM course_enrollment_requests 
        ORDER BY created_at DESC 
        LIMIT 5
      `);
      recentEnrollments = recentResult.rows;
    }

    return NextResponse.json({
      tables: {
        course_enrollment_requests: enrollmentTableExists,
        seminar_applications: seminarTableExists,
        users: usersTableExists,
        courses: coursesTableExists
      },
      enrollmentTableColumns: enrollmentColumns,
      recentEnrollments: recentEnrollments,
      databaseEnv: {
        DB_HOST: process.env.DB_HOST ? 'SET' : 'NOT SET',
        DB_NAME: process.env.DB_NAME ? 'SET' : 'NOT SET',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET'
      }
    });

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
