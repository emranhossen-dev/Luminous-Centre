import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    // Test basic database connection
    const timeResult = await query('SELECT NOW() as current_time');
    console.log('Database time test:', timeResult.rows[0]);

    // Test notifications table structure
    const tableInfo = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'notifications' 
      ORDER BY ordinal_position
    `);
    console.log('Notifications table columns:', tableInfo.rows);

    return NextResponse.json({
      success: true,
      message: 'Database connection working perfectly',
      currentTime: timeResult.rows[0].current_time,
      tableColumns: tableInfo.rows
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
