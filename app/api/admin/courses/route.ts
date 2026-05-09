import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { query } from '@/lib/database';
import { logActivity } from '@/lib/auth';

// GET /api/admin/courses - Get all courses (admin)
export async function GET(req: NextRequest, context: { params: Promise<{}> }) {
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
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status'); // Don't default to 'published' for admin
    const category = searchParams.get('category');

    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let queryParams: any[] = [limit, offset];

    if (status) {
      whereClause += ` AND c.status = $${queryParams.length + 1}`;
      queryParams.push(status);
    }

    if (category) {
      whereClause += ` AND c.category = $${queryParams.length + 1}`;
      queryParams.push(category);
    }

    const coursesQuery = `
      SELECT 
        c.*,
        u.first_name || ' ' || u.last_name as created_by_name,
        COUNT(e.id) as enrollment_count
      FROM courses c
      LEFT JOIN users u ON c.created_by = u.id
      LEFT JOIN enrollments e ON c.id = e.course_id
      ${whereClause}
      GROUP BY c.id, u.first_name, u.last_name
      ORDER BY c.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await query(coursesQuery, queryParams);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM courses c
      ${whereClause.replace('LIMIT $1 OFFSET $2', '')}
    `;
    
    const countResult = await query(countQuery, queryParams.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    return NextResponse.json({
      courses: result.rows,
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
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// POST /api/admin/courses - Create new course (admin)
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
      category,
      price,
      old_price,
      thumbnail_url,
      access_type,
      status,
      featured,
      batch,
      enrollment_ends,
      class_starts,
      selected_days,
      course_outline_url
    } = courseData;

    // Debug logging to see what we're receiving
    console.log('Received course data:', courseData);
    console.log('Category value:', category, 'Type:', typeof category);
    console.log('Selected days:', selected_days, 'Type:', typeof selected_days);

    // Ensure category is never null
    const safeCategory = category || 'online';
    console.log('Safe category:', safeCategory);

    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Title, slug, and category are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingCourse = await query(
      'SELECT id FROM courses WHERE slug = $1',
      [slug]
    );

    if (existingCourse.rows.length > 0) {
      return NextResponse.json(
        { error: 'Course with this slug already exists' },
        { status: 409 }
      );
    }

    // Create course with all fields including enrollment_ends, class_starts, selected_days, and course_outline_url
    const result = await query(`
      INSERT INTO courses (
        title, slug, description, category, price, old_price,
        thumbnail_url, access_type, status, featured, batch,
        enrollment_ends, class_starts, selected_days, course_outline_url, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `, [
      title || 'Untitled Course',
      slug || `course-${Date.now()}`,
      description || '',
      safeCategory,
      parseFloat(price) || 0,
      parseFloat(old_price) || 0,
      thumbnail_url || '',
      access_type || 'paid',
      status || 'draft',
      Boolean(featured) || false,
      batch || '',
      enrollment_ends || null,
      class_starts || null,
      selected_days || [],
      course_outline_url || null,
      user.id
    ]);

    // Log activity
    await logActivity(
      user.id,
      'courses.create',
      'course',
      result.rows[0].id,
      { title, slug, category }
    );

    return NextResponse.json({
      message: 'Course created successfully',
      course: result.rows[0]
    });

  } catch (error) {
    console.error('Create course error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create course',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/courses - Update course (for publish/unpublish)
export async function PUT(req: NextRequest, context: { params: Promise<{}> }) {
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

    const { id, status, ...updateData } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (status !== undefined) {
      updateFields.push(`status = $${paramCount++}`);
      updateValues.push(status);
    }

    // Add other fields that can be updated
    const allowedFields = ['title', 'slug', 'description', 'category', 'price', 'old_price', 
                          'thumbnail_url', 'access_type', 'featured', 'batch', 
                          'enrollment_ends', 'class_starts', 'selected_days'];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updateFields.push(`${field} = $${paramCount++}`);
        if (field === 'selected_days') {
          updateValues.push(JSON.stringify(updateData[field] || []));
        } else if (field === 'price' || field === 'old_price') {
          updateValues.push(parseFloat(updateData[field]) || 0);
        } else {
          updateValues.push(updateData[field]);
        }
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Add updated_at timestamp
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    
    // Add course ID to values
    updateValues.push(id);

    const updateQuery = `
      UPDATE courses 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Log activity
    await logActivity(
      user.id,
      'courses.update',
      'course',
      result.rows[0].id,
      { updatedFields: updateFields, status }
    );

    return NextResponse.json({
      message: 'Course updated successfully',
      course: result.rows[0]
    });

  } catch (error) {
    console.error('Update course error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update course',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}


