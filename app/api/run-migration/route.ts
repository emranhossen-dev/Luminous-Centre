import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST() {
  try {
    console.log('Running database migration to add all course fields...');
    
    // Add missing columns one by one to avoid errors
    const migrations = [
      'ALTER TABLE courses ADD COLUMN IF NOT EXISTS promo_video_url VARCHAR(500)',
      'ALTER TABLE courses ADD COLUMN IF NOT EXISTS access_type VARCHAR(20) DEFAULT \'paid\'',
      'ALTER TABLE courses ADD COLUMN IF NOT EXISTS batch VARCHAR(50)',
      'ALTER TABLE courses ADD COLUMN IF NOT EXISTS class_time TEXT',
      'ALTER TABLE courses ADD COLUMN IF NOT EXISTS course_details JSONB',
      'ALTER TABLE courses ADD COLUMN IF NOT EXISTS short_description TEXT',
      'ALTER TABLE courses ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT \'English\'',
      'ALTER TABLE courses ADD COLUMN IF NOT EXISTS level VARCHAR(50) DEFAULT \'Beginner\'',
      'ALTER TABLE courses ADD COLUMN IF NOT EXISTS duration_weeks INTEGER DEFAULT 0',
      'ALTER TABLE courses ADD COLUMN IF NOT EXISTS total_hours INTEGER DEFAULT 0',
      'ALTER TABLE courses ADD COLUMN IF NOT EXISTS old_price DECIMAL(10, 2) DEFAULT 0'
    ];

    const results = [];
    for (const migration of migrations) {
      try {
        await query(migration);
        console.log('✅ Executed:', migration);
        results.push({ migration, status: 'success' });
      } catch (error) {
        console.log('⚠️  Skipped (may already exist):', migration);
        results.push({ migration, status: 'skipped', error: error.message });
      }
    }

    // Update existing records
    console.log('Updating existing records with default values...');
    try {
      await query(`
        UPDATE courses SET 
          access_type = COALESCE(access_type, 'paid'),
          class_time = COALESCE(class_time, '[]'),
          course_details = COALESCE(course_details, '{}'),
          short_description = COALESCE(short_description, ''),
          language = COALESCE(language, 'English'),
          level = COALESCE(level, 'Beginner'),
          duration_weeks = COALESCE(duration_weeks, 0),
          total_hours = COALESCE(total_hours, 0),
          old_price = COALESCE(old_price, 0)
        WHERE access_type IS NULL OR class_time IS NULL OR course_details IS NULL 
           OR short_description IS NULL OR language IS NULL OR level IS NULL 
           OR duration_weeks IS NULL OR total_hours IS NULL OR old_price IS NULL
      `);
      console.log('✅ Updated existing records');
    } catch (error) {
      console.log('⚠️  Update failed (may not be needed):', error.message);
    }

    // Show updated table structure
    const structure = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'courses' 
      ORDER BY ordinal_position
    `);

    console.log('\n📋 Updated courses table structure:');
    structure.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
    });

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully!',
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
