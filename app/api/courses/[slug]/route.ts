import { NextRequest, NextResponse } from 'next/server';
import { query, tableExists } from '@/lib/database';
import { verifyToken, getUserById } from '@/lib/auth';
import { logActivity } from '@/lib/auth';

// GET /api/courses/[slug] - Get single course
export async function GET(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;

    const courseQuery = `
      SELECT 
        c.*,
        u.first_name as "creatorFirstName",
        u.last_name as "creatorLastName",
        COUNT(DISTINCT e.id) as "enrollmentCount"
      FROM courses c
      LEFT JOIN users u ON c.created_by = u.id
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

    // Optional tables: only query when present (no failed queries / error logs)
    let modulesResult = { rows: [] as any[] };
    if (await tableExists('course_modules')) {
      const modulesQuery = `
        SELECT * FROM course_modules 
        WHERE course_id = $1 
        ORDER BY order_index ASC
      `;
      modulesResult = await query(modulesQuery, [course.id]);
    }

    let projectsResult = { rows: [] as any[] };
    if (await tableExists('course_projects')) {
      const projectsQuery = `
        SELECT * FROM course_projects 
        WHERE course_id = $1 
        ORDER BY order_index ASC
      `;
      projectsResult = await query(projectsQuery, [course.id]);
    }

    // Transform course data to match CourseData structure for banner
    const courseData = {
      id: course.id.toString(),
      slug: course.slug,
      badge: course.category === 'online' ? 'Online Course' : 
             course.category === 'offline' ? 'Offline Course' : 
             course.category === 'recorded' ? 'Recorded Course' : 'Course',
      title: course.title,
      description: course.description || course.short_description || '',
      current_price: parseFloat(course.price) || 0,
      regular_price: parseFloat(course.old_price) || 0,
      currency: 'TK',
      classes_count: course.total_hours ? `${course.total_hours}+` : '60+',
      projects_count: '12+',
      enrollment_deadline: course.enrollment_ends || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      class_start_date: course.class_starts || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      thumbnail_url: course.thumbnail_url || '',
      video_url: course.preview_video_url || '',
      course_outline_url: course.course_outline_url || '',
      learning_outcomes: [
        { title: 'প্রফেশনাল স্কিল', subtitle: 'ইন্ডাস্ট্রি স্ট্যান্ডার্ড', icon: 'TrendingUp' },
        { title: 'রিয়েল প্রোজেক্ট', subtitle: '12+ প্রোজেক্ট তৈরি', icon: 'CheckSquare' },
        { title: 'এক্সপার্ট গাইড', subtitle: 'বিগিনার টু এডভান্সড', icon: 'Users' },
        { title: 'সার্টিফিকেট', subtitle: 'কমপ্লিশন সার্টিফিকেট', icon: 'Award' }
      ]
    };

    return NextResponse.json({
      ...courseData,
      // Also include original course data for admin editing
      originalCourse: {
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
}

// PUT /api/courses/[slug] - Update course
export async function PUT(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
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

    const { slug } = await context.params;
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
      'title', 'description', 'short_description', 'category', 
      'price', 'old_price', 'language', 'level', 'duration_weeks',
      'total_hours', 'thumbnail_url', 'preview_video_url', 'status',
      // Course details specific fields
      'badge', 'current_price', 'regular_price', 'currency',
      'classes_count', 'projects_count', 'enrollment_deadline',
      'class_start_date', 'video_url', 'learning_outcomes'
    ];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        const dbField = field.replace(/([A-Z])/g, '_$1').toLowerCase();
        
        if (field === 'learning_outcomes') {
          // Handle JSON field separately
          updateFields.push(`${dbField} = $${paramIndex}::jsonb`);
          updateValues.push(JSON.stringify(updateData[field]));
          paramIndex++;
        } else {
          updateFields.push(`${dbField} = $${paramIndex++}`);
          updateValues.push(updateData[field]);
        }
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
}

// DELETE /api/courses/[slug] - Delete course
export async function DELETE(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
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
    const { slug } = await context.params;

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
}

