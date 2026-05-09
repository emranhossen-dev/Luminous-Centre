import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { query } from '@/lib/database';
import { logActivity } from '@/lib/auth';

// GET /api/admin/course-banners - Get all course banners
export async function GET(req: NextRequest, context: { params: Promise<{ id?: string }> }) {
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

    const result = await query(`
      SELECT 
        id,
        badge,
        title,
        description,
        current_price,
        regular_price,
        currency,
        classes_count,
        projects_count,
        enrollment_deadline,
        class_start_date,
        thumbnail_url,
        video_url,
        learning_outcomes,
        updated_at,
        course_id
      FROM course_banners
      ORDER BY updated_at DESC
    `);

    return NextResponse.json({
      courseBanners: result.rows
    });

  } catch (error) {
    console.error('Get course banners error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course banners' },
      { status: 500 }
    );
  }
}

// POST /api/admin/course-banners - Create new course banner
export async function POST(req: NextRequest, context: { params: Promise<{}> }) {
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

    const formData = await req.json();
    const { banner } = formData;

    const result = await query(`
      INSERT INTO course_banners (
        badge, title, description, current_price, regular_price,
        currency, classes_count, projects_count, enrollment_deadline,
        class_start_date, thumbnail_url, video_url, learning_outcomes,
        course_id, created_by, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      banner.badge,
      banner.title,
      banner.description,
      banner.pricing.current,
      banner.pricing.regular,
      banner.pricing.currency,
      banner.stats.classes,
      banner.stats.projects,
      banner.enrollment.deadlineDate,
      banner.enrollment.startDate,
      banner.enrollment.thumbnailUrl,
      banner.videoSection.videoUrl,
      JSON.stringify(banner.learningOutcomes.features),
      user.id,
      new Date()
    ]);

    // Log activity
    await logActivity(
      user.id,
      'course_banners.create',
      'course_banner',
      result.rows[0].id,
      JSON.stringify({ title: banner.title, badge: banner.badge })
    );

    return NextResponse.json({
      message: 'Course banner created successfully',
      courseBanner: result.rows[0]
    });

  } catch (error) {
    console.error('Create course banner error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create course banner',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/course-banners/[id] - Update course banner
export async function PUT(req: NextRequest, context: { params: Promise<{ id?: string }> }) {
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
    if (!id) {
      return NextResponse.json({ error: 'Course banner ID is required' }, { status: 400 });
    }

    const formData = await req.json();
    const { banner } = formData;

    const result = await query(`
      UPDATE course_banners SET
        badge = $1,
        title = $2,
        description = $3,
        current_price = $4,
        regular_price = $5,
        currency = $6,
        classes_count = $7,
        projects_count = $8,
        enrollment_deadline = $9,
        class_start_date = $10,
        thumbnail_url = $11,
        video_url = $12,
        learning_outcomes = $13,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
      RETURNING *
    `, [
      banner.badge,
      banner.title,
      banner.description,
      banner.pricing.current,
      banner.pricing.regular,
      banner.pricing.currency,
      banner.stats.classes,
      banner.stats.projects,
      banner.enrollment.deadlineDate,
      banner.enrollment.startDate,
      banner.enrollment.thumbnailUrl,
      banner.videoSection.videoUrl,
      JSON.stringify(banner.learningOutcomes.features),
      Number(id)
    ]);

    // Log activity
    await logActivity(
      user.id,
      'course_banners.update',
      'course_banner',
      Number(id),
      JSON.stringify({ title: banner.title, badge: banner.badge })
    );

    return NextResponse.json({
      message: 'Course banner updated successfully',
      courseBanner: result.rows[0]
    });

  } catch (error) {
    console.error('Update course banner error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update course banner',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/course-banners/[id] - Delete course banner
export async function DELETE(req: NextRequest, context: { params: Promise<{ id?: string }> }) {
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
    if (!id) {
      return NextResponse.json({ error: 'Course banner ID is required' }, { status: 400 });
    }

    // Check if course banner exists
    const existingBanner = await query(
      'SELECT id FROM course_banners WHERE id = $1',
      [id]
    );

    if (existingBanner.rows.length === 0) {
      return NextResponse.json(
        { error: 'Course banner not found' },
        { status: 404 }
      );
    }

    await query('DELETE FROM course_banners WHERE id = $1', [id]);

    // Log activity
    await logActivity(
      user.id,
      'course_banners.delete',
      'course_banner',
      Number(id),
      {}
    );

    return NextResponse.json({
      message: 'Course banner deleted successfully'
    });

  } catch (error) {
    console.error('Delete course banner error:', error);
    return NextResponse.json(
      { error: 'Failed to delete course banner' },
      { status: 500 }
    );
  }
}
