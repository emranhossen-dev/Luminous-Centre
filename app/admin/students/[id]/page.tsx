import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, GraduationCap, Clock, CheckCircle2, Award, Mail, Phone, MapPin } from 'lucide-react';
import pool from '@/lib/database';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function StudentDetailsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  let student: any = null;
  let enrollments: any[] = [];
  
  try {
    const res = await pool.query(`
      SELECT s.*, m.name as mentor_name 
      FROM students s
      LEFT JOIN mentors m ON s.mentor_id = m.id
      WHERE s.id = $1 AND s.deleted_at IS NULL
    `, [id]);
    
    if (res.rows.length === 0) {
      return notFound();
    }
    student = res.rows[0];

    const enrollRes = await pool.query(`
      SELECT e.*, c.title as course_title, c.thumbnail 
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.student_id = $1
    `, [id]);
    enrollments = enrollRes.rows;

  } catch (error) {
    console.error('Failed to fetch student details', error);
    return notFound();
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Student Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Student Profile */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 overflow-hidden flex items-center justify-center font-bold text-3xl">
                {student.avatar ? (
                  <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                ) : (
                  student.name.charAt(0)
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{student.name}</h2>
                <p className="text-gray-500 text-sm">{student.department || 'No Department'}</p>
                <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {student.status}
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-6 mt-6 border-t border-gray-100">
              <div className="flex items-center text-gray-600 text-sm">
                <Mail className="w-4 h-4 mr-3 text-gray-400" />
                {student.email}
              </div>
              {student.phone && (
                <div className="flex items-center text-gray-600 text-sm">
                  <Phone className="w-4 h-4 mr-3 text-gray-400" />
                  {student.phone}
                </div>
              )}
            </div>

            <div className="pt-6 mt-6 border-t border-gray-100">
              <div className="text-sm font-semibold text-gray-900 mb-2">Assigned Mentor</div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-800">{student.mentor_name || 'Unassigned'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tabs (Courses, Progress) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="flex border-b">
              <button className="px-6 py-4 text-sm font-medium text-blue-600 border-b-2 border-blue-600 bg-blue-50/50">
                Enrolled Courses
              </button>
              <button className="px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50">
                Quiz Results
              </button>
              <button className="px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50">
                Certificates
              </button>
              <button className="px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50">
                Activity Logs
              </button>
            </div>

            <div className="p-6">
              {enrollments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p>This student is not enrolled in any courses yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {enrollments.map((enroll) => (
                    <div key={enroll.id} className="flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-lg hover:border-blue-200 transition-colors">
                      <div className="w-full sm:w-24 h-16 bg-gray-200 rounded object-cover flex-shrink-0 flex items-center justify-center text-gray-400">
                        {enroll.thumbnail ? <img src={enroll.thumbnail} alt="" className="w-full h-full object-cover rounded" /> : <BookOpen className="w-6 h-6" />}
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-bold text-gray-900">{enroll.course_title}</h4>
                        <div className="text-xs text-gray-500 mt-1 flex gap-4">
                          <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> Enrolled: {new Date(enroll.enrolled_at).toLocaleDateString()}</span>
                          {enroll.completed_at && <span className="flex items-center text-green-600"><CheckCircle2 className="w-3 h-3 mr-1"/> Completed</span>}
                        </div>
                      </div>
                      <div className="w-full sm:w-32 text-right space-y-1">
                        <div className="text-sm font-medium text-gray-700">{enroll.completion_percentage}%</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${enroll.completion_percentage}%` }}></div>
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
