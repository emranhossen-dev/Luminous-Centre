import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    // Test basic database connection
    const timeResult = await query('SELECT NOW() as current_time');
    console.log('Database time test:', timeResult.rows[0]);

    // Test courses table structure
    const tableInfo = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'courses' 
      ORDER BY ordinal_position
    `);
    console.log('Courses table columns:', tableInfo.rows.map(r => r.column_name));

    // Test a simple insert to courses table
    const testSlug = 'test-course-' + Date.now();
    const insertTest = await query(`
      INSERT INTO courses (title, slug, status, featured, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, title, slug
    `, ['Test Course', testSlug, 'draft', false, 1]);

    console.log('Test insert result:', insertTest.rows[0]);

    // Clean up the test record
    await query('DELETE FROM courses WHERE slug = $1', [testSlug]);

    return NextResponse.json({
      success: true,
      message: 'Database connection working perfectly',
      currentTime: timeResult.rows[0].current_time,
      tableColumns: tableInfo.rows.map(r => r.column_name),
      testInsert: insertTest.rows[0]
    });

  } catch (error) {
    console.error('Database test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
