import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { query } from '@/lib/database';
import { detectEnrollmentUserColumn } from '@/lib/enrollment';
import { ensureLMSFeaturesSchema } from '@/lib/lms-features';

// GET /api/student/assignments - Get assignments for courses student is enrolled in
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

    // Get student enrolled course ids
    const userColumn = await detectEnrollmentUserColumn();
    const enrollmentsResult = await query(
      `SELECT course_id FROM enrollments WHERE ${userColumn} = $1 AND status = 'active'`,
      [user.id]
    );
    
    if (enrollmentsResult.rows.length === 0) {
      return NextResponse.json({ assignments: [] });
    }

    const courseIds = enrollmentsResult.rows.map(row => row.course_id);

    // Fetch assignments for enrolled courses with student's submissions (if any)
    const assignmentsResult = await query(
      `SELECT 
        a.id,
        a.course_id as "courseId",
        a.title,
        a.description,
        a.max_marks as "maxMarks",
        a.due_date as "dueDate",
        a.file_url as "fileUrl",
        c.title as "courseTitle",
        sub.id as "submissionId",
        sub.submission_url as "submissionUrl",
        sub.student_comment as "studentComment",
        sub.submitted_at as "submittedAt",
        sub.marks_obtained as "marksObtained",
        sub.mentor_feedback as "mentorFeedback",
        sub.graded_at as "gradedAt"
       FROM assignments a
       JOIN courses c ON a.course_id = c.id
       LEFT JOIN assignment_submissions sub ON a.id = sub.assignment_id AND sub.user_id = $2
       WHERE a.course_id = ANY($1)
       ORDER BY a.due_date ASC`,
      [courseIds, user.id]
    );

    return NextResponse.json({ assignments: assignmentsResult.rows });
  } catch (error: any) {
    console.error('Get student assignments error:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments', details: error.message }, { status: 500 });
  }
}
