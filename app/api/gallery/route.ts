import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyToken, getUserById } from '@/lib/auth';

const isValidUUID = (id: any) => 
  typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// GET /api/gallery — public: fetch all or featured
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get('featured');
    const category = searchParams.get('category');
    const limit = searchParams.get('limit');

    let sql = `SELECT * FROM gallery WHERE 1=1`;
    const params: any[] = [];

    if (featured === 'true') {
      params.push(true);
      sql += ` AND is_featured = $${params.length}`;
    }
    if (category && category !== 'all') {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    sql += ` ORDER BY sort_order ASC, created_at DESC`;

    if (limit) {
      params.push(parseInt(limit));
      sql += ` LIMIT $${params.length}`;
    }

    const result = await query(sql, params);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Gallery GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 });
  }
}

// POST /api/gallery — admin: add new photo
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
    const uploaderId = isValidUUID(payload.userId) ? payload.userId : null;

    // Helper for safe single row insertion
    const insertSingleItem = async (item: any) => {
      if (!item.image_url) return null;
      try {
        const res = await query(
          `INSERT INTO gallery (title, description, category, image_url, is_featured, sort_order, uploaded_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          [
            item.title || '', 
            item.description || '', 
            item.category || 'general', 
            item.image_url, 
            item.is_featured ?? false, 
            item.sort_order ?? 0, 
            uploaderId
          ]
        );
        return res.rows[0];
      } catch (err) {
        console.warn('Initial gallery insert failed, attempting fallback without uploaded_by:', err);
        // Fallback without uploaded_by column
        const res = await query(
          `INSERT INTO gallery (title, description, category, image_url, is_featured, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
          [
            item.title || '', 
            item.description || '', 
            item.category || 'general', 
            item.image_url, 
            item.is_featured ?? false, 
            item.sort_order ?? 0
          ]
        );
        return res.rows[0];
      }
    };

    // Support array bulk insert
    if (Array.isArray(body)) {
      const inserted = [];
      for (const item of body) {
        const row = await insertSingleItem(item);
        if (row) inserted.push(row);
      }
      return NextResponse.json({ success: true, count: inserted.length, data: inserted }, { status: 201 });
    }

    // Single item insert
    if (!body.image_url) {
      return NextResponse.json({ error: 'image_url is required' }, { status: 400 });
    }

    const row = await insertSingleItem(body);
    return NextResponse.json({ success: true, data: row }, { status: 201 });
  } catch (error: any) {
    console.error('Gallery POST error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to add gallery item' }, { status: 500 });
  }
}

// PATCH /api/gallery — admin: update photo (featured or order)
export async function PATCH(req: NextRequest) {
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
    const { id, is_featured, title, description, category, sort_order } = body;

    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const updates: string[] = [];
    const params: any[] = [];

    if (typeof is_featured === 'boolean') {
      params.push(is_featured);
      updates.push(`is_featured = $${params.length}`);
    }
    if (typeof title === 'string') {
      params.push(title);
      updates.push(`title = $${params.length}`);
    }
    if (typeof description === 'string') {
      params.push(description);
      updates.push(`description = $${params.length}`);
    }
    if (typeof category === 'string') {
      params.push(category);
      updates.push(`category = $${params.length}`);
    }
    if (typeof sort_order === 'number') {
      params.push(sort_order);
      updates.push(`sort_order = $${params.length}`);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    params.push(id);
    const sql = `UPDATE gallery SET ${updates.join(', ')} WHERE id = $${params.length} RETURNING *`;
    const result = await query(sql, params);

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Gallery PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update photo' }, { status: 500 });
  }
}

// DELETE /api/gallery?id=xxx — admin: delete photo
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

    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    await query(`DELETE FROM gallery WHERE id = $1`, [id]);
    return NextResponse.json({ success: true, message: 'Photo deleted' });
  } catch (error) {
    console.error('Gallery DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
}
