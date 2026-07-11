"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Edit, Mail, Phone, Briefcase, Star, Users, BookOpen, Plus, X, GraduationCap, Award, Trash2 } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Mentor {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  designation?: string;
  experience?: string;
  bio?: string;
  skills?: string[];
  status: string;
  rating?: number;
}

interface Course {
  id: number;
  title: string;
  category: string;
  status: string;
  price?: number;
  batch?: string;
  thumbnail_url?: string;
}

interface MentorDetailsClientProps {
  initialMentor: Mentor;
  initialStats: { courses: number; quizzes: number; students: number };
  initialAssignedCourses: Course[];
  allCourses: { id: number; title: string; batch?: string }[];
}

export default function MentorDetailsClient({
  initialMentor,
  initialStats,
  initialAssignedCourses,
  allCourses
}: MentorDetailsClientProps) {
  const [assignedCourses, setAssignedCourses] = useState<Course[]>(initialAssignedCourses);
  const [stats, setStats] = useState(initialStats);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filter courses that are not already assigned to this mentor
  const availableCourses = allCourses.filter(c => !assignedCourses.some(ac => ac.id === c.id));

  const handleAssignCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) {
      toast.error('Please select a course');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/courses/${selectedCourseId}/assign-mentor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mentorId: initialMentor.id })
      });

      if (response.ok) {
        toast.success('Course assigned to mentor successfully! 🚀');
        setAssignModalOpen(false);
        setSelectedCourseId('');
        
        // Find assigned course details
        const newlyAssigned = allCourses.find(c => c.id === parseInt(selectedCourseId));
        if (newlyAssigned) {
          const freshCourse: Course = {
            id: newlyAssigned.id,
            title: newlyAssigned.title,
            category: 'online',
            status: 'published',
            batch: newlyAssigned.batch
          };
          setAssignedCourses(prev => [...prev, freshCourse]);
          setStats(prev => ({ ...prev, courses: prev.courses + 1 }));
        }
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to assign course');
      }
    } catch (error) {
      console.error('Assign course error:', error);
      toast.error('An error occurred while assigning the course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnassignCourse = async (courseId: number) => {
    if (!window.confirm('Are you sure you want to unassign this course from the mentor?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/courses/${courseId}/assign-mentor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mentorId: null })
      });

      if (response.ok) {
        toast.success('Course unassigned successfully');
        setAssignedCourses(prev => prev.filter(c => c.id !== courseId));
        setStats(prev => ({ ...prev, courses: Math.max(0, prev.courses - 1) }));
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to unassign course');
      }
    } catch (error) {
      console.error('Unassign course error:', error);
      toast.error('Failed to unassign course');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-white">Mentor Details</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Profile Card */}
        <div className="md:col-span-1 bg-slate-900 border border-white/10 p-6 rounded-3xl space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-32 h-32 rounded-full bg-slate-800 border border-white/5 overflow-hidden flex items-center justify-center font-bold text-4xl text-blue-400 shadow-inner">
              {initialMentor.avatar ? (
                <img src={initialMentor.avatar} alt={initialMentor.name} className="w-full h-full object-cover" />
              ) : (
                initialMentor.name.charAt(0)
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{initialMentor.name}</h2>
              <p className="text-blue-400 font-semibold text-sm mt-0.5">{initialMentor.designation || 'Mentor'}</p>
              <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-600/10 text-emerald-400 border border-emerald-500/20">
                {initialMentor.status}
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-white/5 text-slate-300">
            <div className="flex items-center text-sm">
              <Mail className="w-4 h-4 mr-3 text-slate-500" />
              {initialMentor.email}
            </div>
            {initialMentor.phone && (
              <div className="flex items-center text-sm">
                <Phone className="w-4 h-4 mr-3 text-slate-500" />
                {initialMentor.phone}
              </div>
            )}
            {initialMentor.experience && (
              <div className="flex items-center text-sm">
                <Briefcase className="w-4 h-4 mr-3 text-slate-500" />
                {initialMentor.experience} Experience
              </div>
            )}
          </div>

          {initialMentor.skills && initialMentor.skills.length > 0 && (
            <div className="pt-6 border-t border-white/5">
              <h3 className="text-sm font-semibold text-white mb-3">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {initialMentor.skills.map((skill: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 bg-slate-800 border border-white/5 text-slate-300 rounded-lg text-xs font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Stats & Course assignment list */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-white/10 p-5 rounded-2xl flex flex-col items-center text-center">
              <BookOpen className="w-6 h-6 text-blue-400 mb-2" />
              <div className="text-2xl font-bold text-white">{stats.courses}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Courses</div>
            </div>
            <div className="bg-slate-900 border border-white/10 p-5 rounded-2xl flex flex-col items-center text-center">
              <Users className="w-6 h-6 text-emerald-400 mb-2" />
              <div className="text-2xl font-bold text-white">{stats.students}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Students</div>
            </div>
            <div className="bg-slate-900 border border-white/10 p-5 rounded-2xl flex flex-col items-center text-center">
              <Award className="w-6 h-6 text-amber-400 mb-2" />
              <div className="text-2xl font-bold text-white">{stats.quizzes}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Quizzes</div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl space-y-3">
            <h3 className="text-lg font-bold text-white">Biography</h3>
            <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">
              {initialMentor.bio || 'No biography provided.'}
            </p>
          </div>

          {/* Assigned Courses Section */}
          <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Assigned Courses</h3>
              <button
                onClick={() => setAssignModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 transition active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5" /> Assign to Course
              </button>
            </div>

            {assignedCourses.length === 0 ? (
              <div className="text-sm text-slate-500 py-12 text-center border border-dashed border-white/10 rounded-2xl bg-slate-950/20">
                <BookOpen className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                This mentor is not assigned to any courses yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {assignedCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-slate-950/50 border border-white/5 rounded-2xl p-4 flex gap-4 items-center hover:border-white/10 transition group relative overflow-hidden"
                  >
                    <div className="w-16 h-12 bg-slate-800 rounded-lg overflow-hidden shrink-0 flex items-center justify-center border border-white/5">
                      {course.thumbnail_url ? (
                        <img src={course.thumbnail_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <BookOpen className="w-6 h-6 text-slate-600" />
                      )}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-white text-sm truncate" title={course.title}>
                        {course.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold mt-0.5">
                        {course.category} {course.batch && `• ${course.batch}`}
                      </p>
                    </div>

                    <button
                      onClick={() => handleUnassignCourse(course.id)}
                      className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition shrink-0 opacity-0 group-hover:opacity-100 absolute top-2 right-2"
                      title="Unassign course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assign Course Modal */}
      <AnimatePresence>
        {assignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setAssignModalOpen(false)} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl z-10"
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-white">Assign to Course</h3>
                <button
                  onClick={() => setAssignModalOpen(false)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAssignCourse} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Select Course <span className="text-red-500">*</span>
                  </label>
                  {availableCourses.length === 0 ? (
                    <p className="text-xs text-slate-500 py-3 italic">
                      No available courses left to assign. Create a course first.
                    </p>
                  ) : (
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 text-sm"
                    >
                      <option value="">Choose a course...</option>
                      {availableCourses.map(course => (
                        <option key={course.id} value={course.id}>
                          {course.title} {course.batch ? `(${course.batch})` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setAssignModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white text-xs font-bold rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || availableCourses.length === 0}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-505 disabled:bg-slate-850 disabled:text-slate-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                  >
                    {submitting ? 'Assigning...' : 'Assign Course'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
