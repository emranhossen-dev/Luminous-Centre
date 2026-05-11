import { NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { withAdminAuth } from '@/lib/admin-auth';

async function handler() {
  try {
    console.log('Fixing invalid category enrollments...');
    
    // Update all "General" enrollments to "offline"
    const generalResult = await query(`
      UPDATE course_enrollment_requests
      SET course_category = 'offline'
      WHERE course_category = 'General'
      RETURNING id, course_title, full_name, course_category
    `);
    
    console.log(`Updated ${generalResult.rows.length} enrollments from "General" to "offline"`);
    
    // Update all "Programming" enrollments to "offline"
    const programmingResult = await query(`
      UPDATE course_enrollment_requests
      SET course_category = 'offline'
      WHERE course_category = 'Programming'
      RETURNING id, course_title, full_name, course_category
    `);
    
    console.log(`Updated ${programmingResult.rows.length} enrollments from "Programming" to "offline"`);
    
    const allUpdated = [...generalResult.rows, ...programmingResult.rows];
    
    allUpdated.forEach(row => {
      console.log(`  - ID ${row.id}: ${row.full_name} - ${row.course_title} -> ${row.course_category}`);
    });
    
    return NextResponse.json({
      success: true,
      message: `Updated ${allUpdated.length} enrollments`,
      updated: allUpdated,
      generalUpdated: generalResult.rows.length,
      programmingUpdated: programmingResult.rows.length
    });
    
  } catch (error) {
    console.error('Fix categories error:', error);
    return NextResponse.json({
      error: 'Failed to fix categories',
      details: error.message
    }, { status: 500 });
  }
}

export const POST = withAdminAuth(handler);
