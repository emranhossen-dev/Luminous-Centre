import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { query } from '@/lib/database';

export async function GET(req: NextRequest) {
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

    // Fetch mentors
    const result = await query(
      'SELECT id, name, email, designation FROM mentors WHERE deleted_at IS NULL ORDER BY name ASC'
    );

    return NextResponse.json({
      mentors: result.rows
    });
  } catch (error: any) {
    console.error('Get admin mentors error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mentors', details: error.message },
      { status: 500 }
    );
  }
}
