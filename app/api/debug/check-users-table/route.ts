import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    // Check users table structure
    const usersTableResult = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);

    // Check actual users data
    const usersDataResult = await query(`
      SELECT id, email, name, created_at FROM users 
      ORDER BY id 
      LIMIT 5
    `);

    return NextResponse.json({
      usersTableColumns: usersTableResult.rows,
      usersData: usersDataResult.rows
    });

  } catch (error) {
    console.error('Check users table error:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
