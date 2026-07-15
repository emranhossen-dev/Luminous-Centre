import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { query } from '@/lib/database';
import { ensureLMSFeaturesSchema } from '@/lib/lms-features';

// POST /api/student/assignments/submit - Submit an assignment
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
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const { assignmentId, submissionUrl, studentComment } = await req.json();

    if (!assignmentId || !submissionUrl) {
      return NextResponse.json({ error: 'Assignment ID and Submission URL/Link are required' }, { status: 400 });
    }

    // Check if user is already enrolled in the course that this assignment belongs to
    // (security check)
    const checkEnrollment = await query(
      `SELECT e.id 
       FROM enrollments e
       JOIN assignments a ON e.course_id = a.course_id
       WHERE a.id = $1 AND (e.user_id = $2 OR e.student_id = $2) AND e.status = 'active'`,
      [assignmentId, user.id]
    );

    if (checkEnrollment.rows.length === 0) {
      return NextResponse.json({ error: 'You are not enrolled in this course or assignment not found' }, { status: 403 });
    }

    // Check if already submitted
    const checkSubmission = await query(
      'SELECT id FROM assignment_submissions WHERE assignment_id = $1 AND user_id = $2',
      [assignmentId, user.id]
    );

    let result;
    if (checkSubmission.rows.length > 0) {
      // Update existing submission
      result = await query(
        `UPDATE assignment_submissions 
         SET submission_url = $1, student_comment = $2, submitted_at = CURRENT_TIMESTAMP, marks_obtained = NULL, mentor_feedback = NULL, graded_by = NULL, graded_at = NULL
         WHERE assignment_id = $3 AND user_id = $4
         RETURNING id`,
        [submissionUrl, studentComment || null, assignmentId, user.id]
      );
    } else {
      // Create new submission
      result = await query(
        `INSERT INTO assignment_submissions (assignment_id, user_id, submission_url, student_comment)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [assignmentId, user.id, submissionUrl, studentComment || null]
      );
    }

    // Find the mentor's user ID and details of the assignment/course to send a notification
    try {
      const mentorQuery = await query(`
        SELECT u.id as mentor_user_id, a.title as assignment_title, c.title as course_title
        FROM assignments a
        JOIN courses c ON a.course_id = c.id
        JOIN mentors m ON c.mentor_id = m.id
        JOIN users u ON m.email = u.email
        WHERE a.id = $1
      `, [assignmentId]);

      if (mentorQuery.rows.length > 0) {
        const { mentor_user_id, assignment_title, course_title } = mentorQuery.rows[0];
        const studentName = `${user.firstName} ${user.lastName}`;
        const notifTitle = 'New Assignment Submission';
        const notifMessage = `${studentName} has submitted assignment "${assignment_title}" in "${course_title}" for review.`;

        await query(`
          INSERT INTO notifications (title, message, recipient_id)
          VALUES ($1, $2, $3)
        `, [notifTitle, notifMessage, mentor_user_id]);
      }
    } catch (notifErr) {
      console.error('Failed to create mentor notification for assignment submission:', notifErr);
    }

    return NextResponse.json({ success: true, message: 'Assignment submitted successfully', submissionId: result.rows[0].id });
  } catch (error: any) {
    console.error('Submit assignment error:', error);
    return NextResponse.json({ error: 'Failed to submit assignment', details: error.message }, { status: 500 });
  }
}
