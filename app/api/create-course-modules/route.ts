import { NextResponse } from 'next/server';
import { query } from '@/lib/database';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    // Read and execute the SQL file
    const sqlFilePath = path.join(process.cwd(), 'database', 'create-course-modules.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split the SQL content by semicolons and execute each statement
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      await query(statement);
    }

    return NextResponse.json({
      success: true,
      message: 'Course modules table created successfully'
    });
  } catch (error: any) {
    console.error('Error creating course modules table:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
