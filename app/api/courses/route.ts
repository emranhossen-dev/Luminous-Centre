import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyToken, getUserById } from '@/lib/auth';
import { logActivity } from '@/lib/auth';

import { getUserFromRequest } from '@/lib/middleware';

// GET /api/courses - Get all courses (with filtering and pagination)
export async function GET(req: NextRequest, context: any) {
  try {
    const user = await getUserFromRequest(req);
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let queryParams: any[] = [];
    let paramIndex = 1;

    // Add filters
    if (category) {
      whereClause += ` AND c.category = $${paramIndex++}`;
      queryParams.push(category);
    }

    if (status) {
      whereClause += ` AND c.status = $${paramIndex++}`;
      queryParams.push(status);
    } else if (!user || (user.roleName !== 'admin' && user.roleName !== 'employee')) {
      // Default for public/students/mentors: only see published courses
      whereClause += ` AND c.status = 'published'`;
    }

    if (featured === 'true') {
      whereClause += ` AND c.featured = true`;
    }

    if (search) {
      whereClause += ` AND (c.title ILIKE $${paramIndex++} OR c.description ILIKE $${paramIndex++})`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    // Different permissions for different roles removed as handled above by status check

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM courses c
      ${whereClause}
    `;
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Get courses with pagination
    const coursesQuery = `
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
      ${whereClause}
      GROUP BY c.id, u.first_name, u.last_name
      ORDER BY c.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    queryParams.push(limit, offset);
    const coursesResult = await query(coursesQuery, queryParams);

    // Debug: Log course categories
    console.log('Total courses found:', total);
    console.log('Requested category:', category);
    console.log('Sample courses with categories:', coursesResult.rows.slice(0, 3).map(c => ({
      id: c.id,
      title: c.title,
      category: c.category,
      status: c.status
    })));

    return NextResponse.json({
      courses: coursesResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get courses error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create new course
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
    const courseData = await req.json();
    const {
      title,
      slug,
      description,
      shortDescription,
      category,
      price,
      oldPrice,
      language = 'bangla',
      level = 'beginner',
      durationWeeks,
      totalHours,
      thumbnailUrl,
      previewVideoUrl,
      status = 'draft'
    } = courseData;

    // Validate required fields
    if (!title || !slug || !category) {
      return NextResponse.json(
        { error: 'Title, slug, and category are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingSlug = await query(
      'SELECT id FROM courses WHERE slug = $1',
      [slug]
    );

    if (existingSlug.rows.length > 0) {
      return NextResponse.json(
        { error: 'Course with this slug already exists' },
        { status: 409 }
      );
    }

    // Create course
    const result = await query(`
      INSERT INTO courses (
        title, slug, description, short_description, category, 
        price, old_price, language, level, duration_weeks, 
        total_hours, thumbnail_url, preview_video_url, status, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      title, slug, description, shortDescription, category,
      price, oldPrice, language, level, durationWeeks,
      totalHours, thumbnailUrl, previewVideoUrl, status, user.id
    ]);

    const newCourse = result.rows[0];

    // Log activity
    await logActivity(
      user.id,
      'course.create',
      'course',
      newCourse.id,
      { title, slug, category },
      undefined,
      req.headers.get('user-agent') || undefined
    );

    return NextResponse.json({
      message: 'Course created successfully',
      course: newCourse
    }, { status: 201 });

  } catch (error) {
    console.error('Create course error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
