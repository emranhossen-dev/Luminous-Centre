import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, GraduationCap, Clock, CheckCircle2, Mail, Phone } from 'lucide-react';
import pool from '@/lib/database';
import { notFound } from 'next/navigation';
import StudentRowActions from '@/components/admin/StudentRowActions';

export const dynamic = 'force-dynamic';

export default async function StudentDetailsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  let student: any = null;
  let enrollments: any[] = [];
  let allMentors: any[] = [];
  
  try {
    // 1. Fetch student info and matching user ID
    const res = await pool.query(`
      SELECT s.*, m.name as mentor_name, u.id as user_id
      FROM students s
      LEFT JOIN mentors m ON s.mentor_id = m.id
      LEFT JOIN users u ON LOWER(u.email) = LOWER(s.email)
      WHERE s.id = $1 AND s.deleted_at IS NULL
    `, [id]);
    
    if (res.rows.length === 0) {
      return notFound();
    }
    student = res.rows[0];

    // 2. Fetch enrolled courses
    const enrollRes = await pool.query(`
      SELECT e.*, c.title as course_title, COALESCE(c.thumbnail, c.thumbnail_url) as thumbnail 
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.student_id = $1
    `, [id]);
    enrollments = enrollRes.rows;

    // 3. Fetch mentors for actions dropdown
    const mentorsRes = await pool.query('SELECT id, name FROM mentors ORDER BY name');
    allMentors = mentorsRes.rows.map(m => ({ id: m.id, name: m.name }));

  } catch (error) {
    console.error('Failed to fetch student details', error);
    return notFound();
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 text-slate-300">
      {/* Header and Back navigation */}
      <div className="flex flex-col gap-2">
        <Link href="/admin/students" className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition-colors gap-1.5 w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Students
        </Link>
        
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">Student Profile</h1>
          {student.user_id && (
            <StudentRowActions student={student} allMentors={allMentors} showViewButton={false} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Student Details Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-xl">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 rounded-2xl bg-blue-500/10 border-2 border-blue-500/20 text-blue-400 overflow-hidden flex items-center justify-center font-bold text-3xl shadow-lg">
                {student.avatar ? (
                  <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                ) : (
                  student.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{student.name}</h2>
                <p className="text-slate-400 text-xs mt-1">{student.designation || 'Student User'}</p>
                <div className="mt-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 border rounded-full text-xs font-bold ${
                    student.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                    student.status === 'suspended' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 
                    'bg-slate-500/10 border-slate-500/20 text-slate-400'
                  }`}>
                    {student.status ? student.status.toUpperCase() : 'INACTIVE'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6 mt-6 border-t border-white/5">
              <div className="flex items-center text-slate-300 text-sm">
                <Mail className="w-4 h-4 mr-3 text-slate-500 shrink-0" />
                <span className="truncate">{student.email}</span>
              </div>
              <div className="flex items-center text-slate-300 text-sm">
                <Phone className="w-4 h-4 mr-3 text-slate-500 shrink-0" />
                <span>{student.phone || 'N/A'}</span>
              </div>
              {student.department && (
                <div className="flex items-center text-slate-300 text-sm">
                  <span className="text-slate-500 text-xs uppercase font-semibold mr-3 shrink-0">Dept:</span>
                  <span>{student.department}</span>
                </div>
              )}
            </div>

            <div className="pt-6 mt-6 border-t border-white/5">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assigned Mentor</div>
              <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/5 rounded-xl">
                <GraduationCap className="w-5 h-5 text-indigo-400 shrink-0" />
                <span className="font-semibold text-sm text-slate-200">
                  {student.mentor_name || 'No Mentor Assigned'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tabs (Courses, Progress) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl overflow-hidden">
            <div className="flex border-b border-white/5 bg-white/5">
              <button className="px-6 py-4 text-sm font-semibold text-blue-400 border-b-2 border-blue-500 bg-blue-500/5">
                Enrolled Courses ({enrollments.length})
              </button>
            </div>

            <div className="p-6">
              {enrollments.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <BookOpen className="w-12 h-12 mx-auto text-slate-700 mb-3" />
                  <p>This student is not enrolled in any courses yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {enrollments.map((enroll) => (
                    <div key={enroll.id} className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-white/5 rounded-xl hover:border-blue-500/30 bg-slate-950/40 hover:bg-slate-950/80 transition-all">
                      <div className="w-full sm:w-24 h-16 bg-slate-900 border border-white/10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center text-slate-700">
                        {enroll.thumbnail ? (
                          <img src={enroll.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="font-bold text-white truncate text-base">{enroll.course_title}</h4>
                        <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-4">
                          <span className="flex items-center"><Clock className="w-3 h-3 mr-1 text-slate-500"/> Enrolled: {new Date(enroll.enrollment_date).toLocaleDateString()}</span>
                          {enroll.status === 'completed' && (
                            <span className="flex items-center text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500"/> Completed
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-full sm:w-36 text-right space-y-1.5 shrink-0">
                        <div className="text-xs font-semibold text-slate-300">Progress: {Math.round(enroll.completion_percentage || 0)}%</div>
                        <div className="w-full bg-slate-900 border border-white/5 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full transition-all duration-350" style={{ width: `${enroll.completion_percentage || 0}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
