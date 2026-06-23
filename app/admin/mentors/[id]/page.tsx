import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit, Mail, Phone, MapPin, Briefcase, Star, Users, BookOpen } from 'lucide-react';
import pool from '@/lib/database';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function MentorDetailsPage({
  params
}: {
  params: { id: string }
}) {
  const { id } = params;

  // Fetch mentor details
  let mentor: any = null;
  let stats: any = { courses: 0, quizzes: 0, students: 0 };
  
  try {
    const res = await pool.query('SELECT * FROM mentors WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (res.rows.length === 0) {
      return notFound();
    }
    mentor = res.rows[0];

    // Dummy stats queries (would join with courses/enrollments normally)
    const statsRes = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM courses WHERE mentor_id = $1) as courses,
        (SELECT COUNT(*) FROM quizzes WHERE mentor_id = $1) as quizzes
    `, [id]);
    stats = statsRes.rows[0];
  } catch (error) {
    console.error('Failed to fetch mentor', error);
    return notFound();
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/mentors" 
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Mentor Details</h1>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-flex items-center text-sm font-medium transition-colors shadow-sm">
          <Edit className="w-4 h-4 mr-2" /> Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
              {mentor.avatar ? (
                <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl text-gray-500 dark:text-slate-400 font-bold">{mentor.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{mentor.name}</h2>
              <p className="text-blue-600 dark:text-blue-400 font-medium">{mentor.designation || 'Mentor'}</p>
              <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                {mentor.status}
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-slate-800">
            <div className="flex items-center text-gray-600 dark:text-slate-300 text-sm">
              <Mail className="w-4 h-4 mr-3 text-gray-400 dark:text-slate-500" />
              {mentor.email}
            </div>
            {mentor.phone && (
              <div className="flex items-center text-gray-600 dark:text-slate-300 text-sm">
                <Phone className="w-4 h-4 mr-3 text-gray-400 dark:text-slate-500" />
                {mentor.phone}
              </div>
            )}
            {mentor.experience && (
              <div className="flex items-center text-gray-600 dark:text-slate-300 text-sm">
                <Briefcase className="w-4 h-4 mr-3 text-gray-400 dark:text-slate-500" />
                {mentor.experience} Experience
              </div>
            )}
          </div>

          {mentor.skills && mentor.skills.length > 0 && (
            <div className="pt-6 border-t border-gray-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {mentor.skills.map((skill: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Details & Analytics */}
        <div className="md:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
              <BookOpen className="w-6 h-6 text-blue-500 mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.courses}</div>
              <div className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider">Courses</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
              <Users className="w-6 h-6 text-green-500 mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{mentor.total_students}</div>
              <div className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider">Students</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
              <Star className="w-6 h-6 text-yellow-500 mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{mentor.rating}</div>
              <div className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider">Rating</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
              <Star className="w-6 h-6 text-purple-500 mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.quizzes}</div>
              <div className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider">Quizzes</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">About Mentor</h3>
            <p className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed">
              {mentor.bio || 'No biography provided yet.'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Assigned Courses</h3>
            {/* We will populate this with actual courses later */}
            <div className="text-sm text-gray-500 dark:text-slate-400 py-4 text-center border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-lg">
              No courses assigned yet.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
