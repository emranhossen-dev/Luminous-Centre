import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { query } from '@/lib/database';
import { ensureLMSFeaturesSchema } from '@/lib/lms-features';
import { sendEmail } from '@/lib/email';

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

    const gradedSubmission = result.rows[0];

    // Query details for student notification email
    const detailsResult = await query(
      `SELECT u.id as "studentUserId", u.email, u.first_name as "firstName", u.last_name as "lastName", a.title as "assignmentTitle", a.max_marks as "maxMarks"
       FROM assignment_submissions s
       JOIN users u ON s.user_id = u.id
       JOIN assignments a ON s.assignment_id = a.id
       WHERE s.id = $1`,
      [submissionId]
    );

    if (detailsResult.rows.length > 0) {
      const details = detailsResult.rows[0];

      // Insert student notification
      try {
        const studentUserId = details.studentUserId;
        const notifTitle = 'Assignment Graded';
        const notifMessage = `Your submission for assignment "${details.assignmentTitle}" has been graded. Marks: ${marksObtained}/${details.maxMarks}.`;

        await query(`
          INSERT INTO notifications (title, message, recipient_id)
          VALUES ($1, $2, $3)
        `, [notifTitle, notifMessage, studentUserId]);
      } catch (notifErr) {
        console.error('Failed to create student notification for assignment grading:', notifErr);
      }

      
      const gradedHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); color: #1e293b;">
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="display: inline-block; background-color: #2563eb; color: white; padding: 12px; border-radius: 12px; font-weight: bold; font-size: 20px; letter-spacing: 0.5px;">Luminous Skill Development Training Center</div>
          </div>
          <h2 style="color: #0f172a; font-size: 20px; font-weight: bold; margin-bottom: 15px;">Assignment Graded</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">Hello <strong>${details.firstName} ${details.lastName}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">Your submission for the assignment <strong>${details.assignmentTitle}</strong> has been graded by the mentor.</p>
          
          <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; padding: 20px; border-radius: 16px; margin: 25px 0;">
            <p style="margin: 0 0 10px 0; font-size: 16px; color: #0f172a;">
              <strong>Marks Obtained:</strong> <span style="color: #2563eb; font-weight: bold; font-size: 18px;">${marksObtained}</span> / ${details.maxMarks}
            </p>
            ${mentorFeedback ? `
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #475569;">
                <strong>Mentor Feedback:</strong> <br/>
                <span style="font-style: italic; color: #334155;">"${mentorFeedback}"</span>
              </p>
            ` : ''}
          </div>
          
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">You can log in to your student dashboard to view complete details of your assignment grades and performance.</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/student" style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 12px; font-weight: bold; font-size: 14px; text-decoration: none; display: inline-block;">
              View Dashboard
            </a>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 25px 0;" />
          <p style="font-size: 11px; text-align: center; color: #94a3b8; margin: 0;">
            Luminous Skill Development Training Center.
          </p>
        </div>
      `;

      if (details.email) {
        sendEmail({
          to: details.email,
          subject: `Assignment Graded: ${details.assignmentTitle} - Luminous Skills`,
          html: gradedHtml
        }).catch(err => console.error('[ASSIGNMENT-GRADED-EMAIL] Error sending grading email:', err));
      }
    }

    return NextResponse.json({ success: true, message: 'Submission graded successfully', graded: gradedSubmission });
  } catch (error: any) {
    console.error('Grade submission error:', error);
    return NextResponse.json({ error: 'Failed to grade submission', details: error.message }, { status: 500 });
  }
}
