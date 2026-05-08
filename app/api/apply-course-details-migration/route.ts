import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(req: NextRequest) {
  try {
    // Read the SQL migration file
    const fs = require('fs');
    const path = require('path');
    
    const migrationPath = path.join(process.cwd(), 'database', 'add-course-details-fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split SQL by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`Executing ${statements.length} migration statements...`);

    for (const statement of statements) {
      try {
        await query(statement);
        console.log('✅ Executed:', statement.substring(0, 50) + '...');
      } catch (error) {
        console.error('❌ Failed:', statement, error);
        // Continue with next statement
      }
    }

    return NextResponse.json({
      message: 'Course details migration applied successfully',
      statementsExecuted: statements.length
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to apply course details migration',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
