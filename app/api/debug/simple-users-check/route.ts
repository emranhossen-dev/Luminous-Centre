import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    // Check users table structure
    const columnsResult = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);

    // Check users without name column
    const usersResult = await query(`
      SELECT id, email, created_at FROM users 
      ORDER BY id 
      LIMIT 5
    `);

    return NextResponse.json({
      columns: columnsResult.rows,
      users: usersResult.rows
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error.message
    }, { status: 500 });
  }
}
