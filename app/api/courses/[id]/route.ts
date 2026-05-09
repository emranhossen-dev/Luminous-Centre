import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyToken, getUserById } from '@/lib/auth';
import { logActivity } from '@/lib/auth';

// GET /api/courses/[id] - Get single course (supports both ID and slug)
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const bySlug = searchParams.get('bySlug');

    // Determine if we should search by slug or ID
    const searchField = bySlug === 'true' ? 'slug' : 'id';
    const searchValue = id;

    const courseQuery = `
      SELECT 
        c.*,
        COUNT(e.id) as "enrollmentCount"
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      WHERE c.${searchField} = $1
      GROUP BY c.id
    `;

    const result = await query(courseQuery, [searchValue]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const course = result.rows[0];

    // Get course modules (if table exists)
    let modules = [];
    try {
      const modulesQuery = `
        SELECT * FROM course_modules 
        WHERE course_id = $1 
        ORDER BY order_index ASC
      `;
      const modulesResult = await query(modulesQuery, [course.id]);
      modules = modulesResult.rows;
    } catch (error) {
      console.log('Course modules table not found, using empty array');
    }

    // Get course projects (if table exists)
    let projects = [];
    try {
      const projectsQuery = `
        SELECT * FROM course_projects 
        WHERE course_id = $1 
        ORDER BY order_index ASC
      `;
      const projectsResult = await query(projectsQuery, [course.id]);
      projects = projectsResult.rows;
    } catch (error) {
      console.log('Course projects table not found, using empty array');
    }

    return NextResponse.json({
      course: {
        ...course,
        modules: modules,
        projects: projects
      }
    });

  } catch (error) {
    console.error('Get course error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[id] - Update course
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    // Authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    const user = await getUserById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const bySlug = searchParams.get('bySlug');
    const updateData = await req.json();

    // Determine if we should search by slug or ID
    const searchField = bySlug === 'true' ? 'slug' : 'id';
    const searchValue = id;

    // Check if course exists
    const existingCourse = await query(`SELECT id FROM courses WHERE ${searchField} = $1`, [searchValue]);
    if (existingCourse.rows.length === 0) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    const allowedFields = [
      'title', 'description', 'shortDescription', 'category', 
      'price', 'oldPrice', 'language', 'level', 'durationWeeks',
      'totalHours', 'thumbnailUrl', 'previewVideoUrl', 'status'
    ];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        const dbField = field.replace(/([A-Z])/g, '_$1').toLowerCase();
        updateFields.push(`${dbField} = $${paramIndex++}`);
        updateValues.push(updateData[field]);
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(existingCourse.rows[0].id);

    const updateQuery = `
      UPDATE courses 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, updateValues);
    const updatedCourse = result.rows[0];

    // Log activity
    await logActivity(
      user.id,
      'course.update',
      'course',
      updatedCourse.id,
      { id: searchValue, updatedFields: Object.keys(updateData) },
      undefined,
      req.headers.get('user-agent') || undefined
    );

    return NextResponse.json({
      message: 'Course updated successfully',
      course: updatedCourse
    });

  } catch (error) {
    console.error('Update course error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id] - Delete course
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    // Authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    const user = await getUserById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const bySlug = searchParams.get('bySlug');

    // Determine if we should search by slug or ID
    const searchField = bySlug === 'true' ? 'slug' : 'id';
    const searchValue = id;

    // Check if course exists
    const existingCourse = await query(`SELECT id, title FROM courses WHERE ${searchField} = $1`, [searchValue]);
    if (existingCourse.rows.length === 0) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const courseId = existingCourse.rows[0].id;
    const courseTitle = existingCourse.rows[0].title;

    // Check if course has enrollments
    const enrollmentsCheck = await query(
      'SELECT COUNT(*) as count FROM enrollments WHERE course_id = $1',
      [courseId]
    );

    if (parseInt(enrollmentsCheck.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'Cannot delete course with active enrollments' },
        { status: 400 }
      );
    }

    // Delete course (cascade will handle related records)
    await query('DELETE FROM courses WHERE id = $1', [courseId]);

    // Log activity
    await logActivity(
      user.id,
      'course.delete',
      'course',
      courseId,
      { id: searchValue, title: courseTitle },
      undefined,
      req.headers.get('user-agent') || undefined
    );

    return NextResponse.json({
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Delete course error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
