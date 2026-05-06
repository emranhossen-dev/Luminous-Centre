import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    // Check database connection
    const result = await query('SELECT NOW() as current_time, version() as version');
    
    // Get table counts
    const tables = await query(`
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    // Get user count
    const userCount = await query('SELECT COUNT(*) as count FROM users');
    
    // Get role count
    const roleCount = await query('SELECT COUNT(*) as count FROM roles');
    
    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        current_time: result.rows[0].current_time,
        version: result.rows[0].version
      },
      tables: tables.rows,
      stats: {
        users: parseInt(userCount.rows[0].count),
        roles: parseInt(roleCount.rows[0].count)
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
