import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { withAuth } from '@/lib/middleware';
import { logActivity } from '@/lib/auth';

// GET /api/courses/[slug] - Get single course
const getCourse = withAuth(async (req: NextRequest, context: any, user: any) => {
  try {
    const { slug } = context.params;

    const courseQuery = `
      SELECT 
        c.*,
        u.first_name as "creatorFirstName",
        u.last_name as "creatorLastName",
        COUNT(DISTINCT cm.id) as "moduleCount",
        COUNT(DISTINCT e.id) as "enrollmentCount"
      FROM courses c
      LEFT JOIN users u ON c.created_by = u.id
      LEFT JOIN course_modules cm ON c.id = cm.course_id
      LEFT JOIN enrollments e ON c.id = e.course_id
      WHERE c.slug = $1
      GROUP BY c.id, u.first_name, u.last_name
    `;

    const result = await query(courseQuery, [slug]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const course = result.rows[0];

    // Get course modules
    const modulesQuery = `
      SELECT * FROM course_modules 
      WHERE course_id = $1 
      ORDER BY order_index ASC
    `;
    const modulesResult = await query(modulesQuery, [course.id]);

    // Get course projects
    const projectsQuery = `
      SELECT * FROM course_projects 
      WHERE course_id = $1 
      ORDER BY order_index ASC
    `;
    const projectsResult = await query(projectsQuery, [course.id]);

    return NextResponse.json({
      course: {
        ...course,
        modules: modulesResult.rows,
        projects: projectsResult.rows
      }
    });

  } catch (error) {
    console.error('Get course error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}, { permissions: ['courses.read'] });

// PUT /api/courses/[slug] - Update course
const updateCourse = withAuth(async (req: NextRequest, context: any, user: any) => {
  try {
    const { slug } = context.params;
    const updateData = await req.json();

    // Check if course exists
    const existingCourse = await query('SELECT id FROM courses WHERE slug = $1', [slug]);
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
      { slug, updatedFields: Object.keys(updateData) },
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
}, { permissions: ['courses.update'] });

// DELETE /api/courses/[slug] - Delete course
const deleteCourse = withAuth(async (req: NextRequest, context: any, user: any) => {
  try {
    const { slug } = context.params;

    // Check if course exists
    const existingCourse = await query('SELECT id, title FROM courses WHERE slug = $1', [slug]);
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
      { slug, title: courseTitle },
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
}, { permissions: ['courses.delete'] });

export const GET = getCourse;
export const PUT = updateCourse;
export const DELETE = deleteCourse;
