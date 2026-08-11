import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export const dynamic = 'force-dynamic';

// GET /api/contact - Fetch messages for admin
export async function GET(req: NextRequest) {
  try {
    const result = await query(`
      SELECT * FROM contact_messages 
      ORDER BY created_at DESC
    `);
    return NextResponse.json({ messages: result.rows || [] });
  } catch (error: any) {
    console.error('Error fetching contact messages:', error);
    return NextResponse.json({ messages: [] }, { status: 500 });
  }
}

// POST /api/contact - Submit new contact message
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, subject, message } = body;

    if (!name || !phone || !message) {
      return NextResponse.json(
        { error: 'Name, phone, and message are required fields.' },
        { status: 400 }
      );
    }

    const insertQuery = `
      INSERT INTO contact_messages (name, phone, email, subject, message, is_read, created_at)
      VALUES ($1, $2, $3, $4, $5, false, NOW())
      RETURNING *
    `;

    const result = await query(insertQuery, [
      name.trim(),
      phone.trim(),
      email ? email.trim() : null,
      subject ? subject.trim() : 'general',
      message.trim()
    ]);

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully!',
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error submitting contact message:', error);
    return NextResponse.json(
      { error: 'Failed to submit message to database.' },
      { status: 500 }
    );
  }
}

// PATCH /api/contact - Mark message as read/unread
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, is_read } = body;

    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    const result = await query(
      `UPDATE contact_messages SET is_read = $1 WHERE id = $2 RETURNING *`,
      [is_read, id]
    );

    return NextResponse.json({ success: true, message: result.rows[0] });
  } catch (error: any) {
    console.error('Error updating message status:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}

// DELETE /api/contact - Delete a contact message
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    await query(`DELETE FROM contact_messages WHERE id = $1`, [id]);
    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting contact message:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
