import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { query } from '@/lib/database';
import { ensureLMSFeaturesSchema } from '@/lib/lms-features';

// GET /api/mentor/assignments/submissions - Get submissions for an assignment
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

    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get('assignmentId');

    if (!assignmentId) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
    }

    // Verify course belongs to mentor (if not admin/employee)
    if (user.roleName !== 'admin' && user.roleName !== 'employee') {
      const mentorRes = await query('SELECT id FROM mentors WHERE email = $1', [user.email]);
      if (mentorRes.rows.length === 0) {
        return NextResponse.json({ error: 'Mentor profile not found' }, { status: 404 });
      }
      const mentorId = mentorRes.rows[0].id;
      
      const accessCheck = await query(
        `SELECT a.id 
         FROM assignments a
         JOIN courses c ON a.course_id = c.id
         WHERE a.id = $1 AND c.mentor_id = $2`,
        [parseInt(assignmentId), mentorId]
      );
      if (accessCheck.rows.length === 0) {
        return NextResponse.json({ error: 'You do not have permission to view submissions for this assignment' }, { status: 403 });
      }
    }

    const submissionsQuery = `
      SELECT 
        s.id,
        s.assignment_id as "assignmentId",
        s.user_id as "userId",
        s.submission_url as "submissionUrl",
        s.student_comment as "studentComment",
        s.submitted_at as "submittedAt",
        s.marks_obtained as "marksObtained",
        s.mentor_feedback as "mentorFeedback",
        s.graded_at as "gradedAt",
        u.first_name as "firstName",
        u.last_name as "lastName",
        u.email,
        a.title as "assignmentTitle",
        a.max_marks as "maxMarks"
      FROM assignment_submissions s
      JOIN users u ON s.user_id = u.id
      JOIN assignments a ON s.assignment_id = a.id
      WHERE s.assignment_id = $1
      ORDER BY s.submitted_at DESC
    `;
    const result = await query(submissionsQuery, [parseInt(assignmentId)]);
    return NextResponse.json({ submissions: result.rows });
  } catch (error: any) {
    console.error('Get assignment submissions error:', error);
    return NextResponse.json({ error: 'Failed to fetch submissions', details: error.message }, { status: 500 });
  }
}

// POST /api/mentor/assignments/submissions - Grade/Review a student submission
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

    const { submissionId, marksObtained, mentorFeedback } = await req.json();

    if (!submissionId || marksObtained === undefined) {
      return NextResponse.json({ error: 'Submission ID and marks are required' }, { status: 400 });
    }

    // Verify course belongs to mentor (if not admin/employee)
    if (user.roleName !== 'admin' && user.roleName !== 'employee') {
      const mentorRes = await query('SELECT id FROM mentors WHERE email = $1', [user.email]);
      if (mentorRes.rows.length === 0) {
        return NextResponse.json({ error: 'Mentor profile not found' }, { status: 404 });
      }
      const mentorId = mentorRes.rows[0].id;
      
      const accessCheck = await query(
        `SELECT s.id 
         FROM assignment_submissions s
         JOIN assignments a ON s.assignment_id = a.id
         JOIN courses c ON a.course_id = c.id
         WHERE s.id = $1 AND c.mentor_id = $2`,
        [submissionId, mentorId]
      );
      if (accessCheck.rows.length === 0) {
        return NextResponse.json({ error: 'You do not have permission to grade this submission' }, { status: 403 });
      }
    }

    // Update submission with grade/marks
    const gradeQuery = `
      UPDATE assignment_submissions 
      SET marks_obtained = $1, mentor_feedback = $2, graded_by = $3, graded_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, marks_obtained as "marksObtained", mentor_feedback as "mentorFeedback"
    `;
    const result = await query(gradeQuery, [
      parseFloat(marksObtained),
      mentorFeedback || null,
      user.id,
      submissionId
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Submission graded successfully', graded: result.rows[0] });
  } catch (error: any) {
    console.error('Grade submission error:', error);
    return NextResponse.json({ error: 'Failed to grade submission', details: error.message }, { status: 500 });
  }
}
