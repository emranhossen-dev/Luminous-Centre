import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST() {
  try {
    console.log('Starting users table fix...');

    // Add role column if it doesn't exist
    try {
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'student'`);
      console.log('Role column added successfully');
    } catch (error) {
      console.log('Note (role column might already exist):', error.message);
    }

    // Update existing users to have appropriate roles
    await query(`UPDATE users SET role = 'admin' WHERE email IN ('admin@luminous.com')`);
    console.log('Admin role updated');

    await query(`UPDATE users SET role = 'employee' WHERE email IN ('employee@luminous.com')`);
    console.log('Employee role updated');

    await query(`UPDATE users SET role = 'mentor' WHERE email IN ('mentor@luminous.com')`);
    console.log('Mentor role updated');

    // Verify the updated table structure
    const columnsResult = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);

    // Check users with their roles
    const usersResult = await query(`
      SELECT id, email, name, role, created_at 
      FROM users 
      ORDER BY id
    `);

    return NextResponse.json({
      success: true,
      message: 'Users table structure updated successfully',
      columns: columnsResult.rows,
      users: usersResult.rows
    });

  } catch (error) {
    console.error('Error fixing users table:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
