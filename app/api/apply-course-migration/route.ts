import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST() {
  try {
    console.log('Applying course launch fields migration...');
    
    // Add the missing columns for course launch form
    const migrations = [
      'ALTER TABLE courses ADD COLUMN IF NOT EXISTS enrollment_ends DATE',
      'ALTER TABLE courses ADD COLUMN IF NOT EXISTS class_starts DATE', 
      'ALTER TABLE courses ADD COLUMN IF NOT EXISTS selected_days JSONB DEFAULT \'[]\'',
      'ALTER TABLE courses ADD COLUMN IF NOT EXISTS access_type VARCHAR(20) DEFAULT \'paid\'',
      'ALTER TABLE courses ADD COLUMN IF NOT EXISTS batch VARCHAR(50)'
    ];

    const results = [];
    for (const migration of migrations) {
      try {
        await query(migration);
        console.log('✅ Executed:', migration);
        results.push({ migration, status: 'success' });
      } catch (error) {
        console.log('⚠️  Skipped:', migration, error.message);
        results.push({ migration, status: 'skipped', error: error.message });
      }
    }

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_courses_enrollment_ends ON courses(enrollment_ends)',
      'CREATE INDEX IF NOT EXISTS idx_courses_class_starts ON courses(class_starts)',
      'CREATE INDEX IF NOT EXISTS idx_courses_selected_days ON courses USING GIN(selected_days)'
    ];

    for (const index of indexes) {
      try {
        await query(index);
        console.log('✅ Created index:', index);
      } catch (error) {
        console.log('⚠️  Index skipped:', index, error.message);
      }
    }

    // Show final table structure
    const structure = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'courses' 
      ORDER BY ordinal_position
    `);

    return NextResponse.json({
      success: true,
      message: 'Course launch fields migration completed!',
      results,
      tableStructure: structure.rows,
      totalColumns: structure.rows.length
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
