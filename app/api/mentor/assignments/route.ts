import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { query } from '@/lib/database';
import { ensureLMSFeaturesSchema } from '@/lib/lms-features';

// GET /api/mentor/assignments - Get assignments for courses taught by the mentor
export async function GET(req: NextRequest) {
  try {
    await ensureLMSFeaturesSchema();

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

    let mentorId = null;
    if (user.roleName !== 'admin') {
      const mentorRes = await query('SELECT id FROM mentors WHERE email = $1', [user.email]);
      if (mentorRes.rows.length === 0) {
        return NextResponse.json({ error: 'Mentor profile not found' }, { status: 404 });
      }
      mentorId = mentorRes.rows[0].id;
    }

    let assignmentsQuery = `
      SELECT 
        a.id,
        a.course_id as "courseId",
        a.title,
        a.description,
        a.max_marks as "maxMarks",
        a.due_date as "dueDate",
        a.file_url as "fileUrl",
        c.title as "courseTitle",
        (SELECT COUNT(*)::int FROM assignment_submissions WHERE assignment_id = a.id) as "submissionsCount",
        (SELECT COUNT(*)::int FROM assignment_submissions WHERE assignment_id = a.id AND marks_obtained IS NOT NULL) as "gradedCount"
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
    `;
    const params = [];
    if (mentorId) {
      assignmentsQuery += ` WHERE c.mentor_id = $1`;
      params.push(mentorId);
    }
    assignmentsQuery += ` ORDER BY a.due_date DESC`;

    const result = await query(assignmentsQuery, params);
    return NextResponse.json({ assignments: result.rows });
  } catch (error: any) {
    console.error('Get mentor assignments error:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments', details: error.message }, { status: 500 });
  }
}

// POST /api/mentor/assignments - Create a new assignment
export async function POST(req: NextRequest) {
  try {
    await ensureLMSFeaturesSchema();

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    const user = await getUserById(payload.userId);
    if (!user || (user.roleName !== 'mentor' && user.roleName !== 'admin' && user.roleName !== 'employee')) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    const { courseId, title, description, maxMarks, dueDate, fileUrl } = await req.json();

    if (!courseId || !title || !dueDate) {
      return NextResponse.json({ error: 'Course, Title, and Due Date are required' }, { status: 400 });
    }

    // Verify course belongs to mentor (if not admin/employee)
    if (user.roleName !== 'admin') {
      const mentorRes = await query('SELECT id FROM mentors WHERE email = $1', [user.email]);
      if (mentorRes.rows.length === 0) {
        return NextResponse.json({ error: 'Mentor profile not found' }, { status: 404 });
      }
      const mentorId = mentorRes.rows[0].id;
      
      const courseCheck = await query('SELECT id FROM courses WHERE id = $1 AND mentor_id = $2', [courseId, mentorId]);
      if (courseCheck.rows.length === 0 && user.roleName !== 'employee') {
        return NextResponse.json({ error: 'You do not teach this course' }, { status: 403 });
      }
    }

    const insertQuery = `
      INSERT INTO assignments (course_id, title, description, max_marks, due_date, file_url, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, course_id as "courseId", title, description, max_marks as "maxMarks", due_date as "dueDate", file_url as "fileUrl"
    `;
    const result = await query(insertQuery, [
      courseId,
      title,
      description || null,
      maxMarks || 100,
      dueDate,
      fileUrl || null,
      user.id
    ]);

    return NextResponse.json({ success: true, assignment: result.rows[0] });
  } catch (error: any) {
    console.error('Create assignment error:', error);
    return NextResponse.json({ error: 'Failed to create assignment', details: error.message }, { status: 500 });
  }
}
