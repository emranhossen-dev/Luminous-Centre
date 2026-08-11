import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { verifyToken, getUserById } from '@/lib/auth';

// GET /api/partners — public (active only) or admin (all if ?all=true)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all');

    let sql = `SELECT * FROM partners`;
    if (all !== 'true') {
      sql += ` WHERE is_active = true`;
    }
    sql += ` ORDER BY sort_order ASC, created_at ASC`;

    const result = await query(sql);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Partners GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 });
  }
}

// POST /api/partners — admin: add new partner
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
    const { name, logo_url, website_url, description, sort_order } = body;

    if (!name || !logo_url) {
      return NextResponse.json({ error: 'name and logo_url are required' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO partners (name, logo_url, website_url, description, is_active, sort_order)
       VALUES ($1, $2, $3, $4, true, $5) RETURNING *`,
      [name, logo_url, website_url || '', description || '', sort_order ?? 0]
    );

    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Partners POST error:', error);
    return NextResponse.json({ error: 'Failed to add partner' }, { status: 500 });
  }
}

// PUT /api/partners — admin: update partner (toggle active or full update)
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
    const { id, name, logo_url, website_url, description, is_active, sort_order } = body;
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const result = await query(
      `UPDATE partners
       SET name = COALESCE($1, name),
           logo_url = COALESCE($2, logo_url),
           website_url = COALESCE($3, website_url),
           description = COALESCE($4, description),
           is_active = COALESCE($5, is_active),
           sort_order = COALESCE($6, sort_order)
       WHERE id = $7 RETURNING *`,
      [name, logo_url, website_url, description, is_active, sort_order, id]
    );

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Partners PUT error:', error);
    return NextResponse.json({ error: 'Failed to update partner' }, { status: 500 });
  }
}

// DELETE /api/partners?id=xxx — admin: delete partner
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

    await query(`DELETE FROM partners WHERE id = $1`, [id]);
    return NextResponse.json({ success: true, message: 'Partner deleted' });
  } catch (error) {
    console.error('Partners DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete partner' }, { status: 500 });
  }
}
