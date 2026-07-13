import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { query, tableExists } from '@/lib/database';
import { detectEnrollmentUserColumn } from '@/lib/enrollment';

export async function GET(req: NextRequest) {
  try {
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

    const userColumn = await detectEnrollmentUserColumn();

    // Get enrolled course IDs
    const enrollRes = await query(
      `SELECT course_id FROM enrollments WHERE ${userColumn} = $1 AND status = 'active'`,
      [user.id]
    );
    const courseIds = enrollRes.rows.map((r: any) => r.course_id);

    if (courseIds.length === 0) {
      return NextResponse.json({
        userName: user.firstName || user.email?.split('@')[0] || 'Student',
        totalAssignments: 0,
        submittedAssignments: 0,
        averageMarks: 0,
        totalVideos: 0,
        watchedVideos: 0,
        overallProgress: 0,
      });
    }

    // 1. Assignment stats
    let totalAssignments = 0, submittedAssignments = 0, averageMarks = 0;
    try {
      const assignRes = await query(
        `SELECT 
          COUNT(a.id)::int as total,
          COUNT(sub.id)::int as submitted,
          COALESCE(AVG(sub.marks_obtained), 0)::numeric(5,1) as avg_marks
        FROM assignments a
        LEFT JOIN assignment_submissions sub ON a.id = sub.assignment_id AND sub.user_id = $2
        WHERE a.course_id = ANY($1)`,
        [courseIds, user.id]
      );
      totalAssignments = assignRes.rows[0]?.total || 0;
      submittedAssignments = assignRes.rows[0]?.submitted || 0;
      averageMarks = parseFloat(assignRes.rows[0]?.avg_marks) || 0;
    } catch (e) {
      // assignments table may not exist yet
    }

    // 2. Video stats
    let totalVideos = 0, watchedVideos = 0;
    try {
      const hasVideoProgress = await tableExists('student_video_progress');
      
      // Count total lesson videos for enrolled courses
      const videoCountRes = await query(
        `SELECT COUNT(lv.id)::int as total
         FROM lesson_videos lv
         JOIN curriculum_topics ct ON lv.lesson_id = ct.id
         JOIN curriculum_modules cm ON ct.module_id = cm.id
         WHERE cm.course_id = ANY($1)`,
        [courseIds]
      );
      totalVideos = videoCountRes.rows[0]?.total || 0;

      if (hasVideoProgress) {
        const watchedRes = await query(
          `SELECT COUNT(*)::int as watched
           FROM student_video_progress svp
           JOIN lesson_videos lv ON svp.lesson_video_id = lv.id
           JOIN curriculum_topics ct ON lv.lesson_id = ct.id
           JOIN curriculum_modules cm ON ct.module_id = cm.id
           WHERE svp.user_id = $1 AND svp.completed = true AND cm.course_id = ANY($2)`,
          [user.id, courseIds]
        );
        watchedVideos = watchedRes.rows[0]?.watched || 0;
      }
    } catch (e) {
      // curriculum tables may not exist
    }

    // 3. Overall progress
    const overallProgress = totalVideos > 0 ? Math.round((watchedVideos / totalVideos) * 100) : 0;

    return NextResponse.json({
      userName: user.firstName || user.email?.split('@')[0] || 'Student',
      totalAssignments,
      submittedAssignments,
      averageMarks,
      totalVideos,
      watchedVideos,
      overallProgress,
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats', details: error.message }, { status: 500 });
  }
}
