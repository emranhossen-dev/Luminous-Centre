import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyToken, getUserById } from '@/lib/auth';

// GET /api/testimonials — public (active only) or admin (all if ?all=true)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all');

    let sql = `SELECT * FROM testimonials`;
    if (all !== 'true') {
      sql += ` WHERE is_active = true`;
    }
    sql += ` ORDER BY sort_order ASC, created_at DESC`;

    const result = await query(sql);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Testimonials GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}

// POST /api/testimonials — admin: add new testimonial
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    const user = await getUserById(payload.userId);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, role, comment, rating, avatar_url, sort_order } = body;

    if (!name || !comment) {
      return NextResponse.json({ error: 'name and comment are required' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO testimonials (name, role, comment, rating, avatar_url, is_active, sort_order)
       VALUES ($1, $2, $3, $4, $5, true, $6) RETURNING *`,
      [name, role || 'Student', comment, rating ?? 5, avatar_url || '', sort_order ?? 0]
    );

    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Testimonials POST error:', error);
    return NextResponse.json({ error: 'Failed to add testimonial' }, { status: 500 });
  }
}

// PUT /api/testimonials — admin: update testimonial or toggle active
export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    const user = await getUserById(payload.userId);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { id, name, role, comment, rating, avatar_url, is_active, sort_order } = body;
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const result = await query(
      `UPDATE testimonials
       SET name = COALESCE($1, name),
           role = COALESCE($2, role),
           comment = COALESCE($3, comment),
           rating = COALESCE($4, rating),
           avatar_url = COALESCE($5, avatar_url),
           is_active = COALESCE($6, is_active),
           sort_order = COALESCE($7, sort_order)
       WHERE id = $8 RETURNING *`,
      [name, role, comment, rating, avatar_url, is_active, sort_order, id]
    );

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Testimonials PUT error:', error);
    return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 });
  }
}

// DELETE /api/testimonials?id=xxx — admin: delete testimonial
export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    const user = await getUserById(payload.userId);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await query(`DELETE FROM testimonials WHERE id = $1`, [id]);
    return NextResponse.json({ success: true, message: 'Testimonial deleted' });
  } catch (error) {
    console.error('Testimonials DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 });
  }
}
