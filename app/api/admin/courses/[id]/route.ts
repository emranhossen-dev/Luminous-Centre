import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { query } from '@/lib/database';
import { logActivity } from '@/lib/auth';

// GET /api/admin/courses/[id] - Get single course (admin)
const getCourse = withAuth(async (req: NextRequest, context: any, user: any) => {
  try {
    const { id } = context.params;

    const result = await query(
      'SELECT * FROM courses WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      course: result.rows[0]
    });
  } catch (error) {
    console.error('Get course error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
});

// PUT /api/admin/courses/[id] - Update course (admin)
const updateCourse = withAuth(async (req: NextRequest, context: any, user: any) => {
  try {
    const { id } = context.params;
    const courseData = await req.json();

    const {
      title,
      slug,
      description,
      short_description,
      category,
      price,
      old_price,
      language,
      level,
      duration_weeks,
      total_hours,
      thumbnail_url,
      preview_video_url,
      promo_video_url,
      access_type,
      class_time,
      batch,
      course_details,
      status,
      featured
    } = courseData;

    if (!title || !slug || !category) {
      return NextResponse.json(
        { error: 'Title, slug, and category are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists (excluding current course)
    const existingCourse = await query(
      'SELECT id FROM courses WHERE slug = $1 AND id != $2',
      [slug, id]
    );

    if (existingCourse.rows.length > 0) {
      return NextResponse.json(
        { error: 'Course with this slug already exists' },
        { status: 409 }
      );
    }

    // Update course
    const result = await query(`
      UPDATE courses SET 
        title = $1, slug = $2, description = $3, short_description = $4, category = $5,
        price = $6, old_price = $7, language = $8, level = $9, duration_weeks = $10,
        total_hours = $11, thumbnail_url = $12, preview_video_url = $13, 
        promo_video_url = $14, access_type = $15, class_time = $16, batch = $17,
        course_details = $18, status = $19, featured = $20, updated_at = CURRENT_TIMESTAMP
      WHERE id = $21
      RETURNING *
    `, [
      title, slug, description, short_description, category,
      price, old_price, language, level, duration_weeks, total_hours,
      thumbnail_url, preview_video_url, promo_video_url, access_type,
      class_time, batch, course_details, status, featured, id
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Log activity
    await logActivity(
      user.id,
      'courses.update',
      'course',
      id,
      { title, slug, category, status }
    );

    return NextResponse.json({
      message: 'Course updated successfully',
      course: result.rows[0]
    });

  } catch (error) {
    console.error('Update course error:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
});

// DELETE /api/admin/courses/[id] - Delete course (admin)
const deleteCourse = withAuth(async (req: NextRequest, context: any, user: any) => {
  try {
    const { id } = context.params;

    // Check if course has enrollments
    const enrollments = await query(
      'SELECT COUNT(*) as count FROM enrollments WHERE course_id = $1',
      [id]
    );

    if (parseInt(enrollments.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'Cannot delete course with active enrollments' },
        { status: 400 }
      );
    }

    // Get course details for logging
    const course = await query(
      'SELECT title, slug, category FROM courses WHERE id = $1',
      [id]
    );

    if (course.rows.length === 0) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Delete course
    await query('DELETE FROM courses WHERE id = $1', [id]);

    // Log activity
    await logActivity(
      user.id,
      'courses.delete',
      'course',
      id,
      { title: course.rows[0].title, slug: course.rows[0].slug, category: course.rows[0].category }
    );

    return NextResponse.json({
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Delete course error:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
});

export const GET = getCourse;
export const PUT = updateCourse;
export const DELETE = deleteCourse;
