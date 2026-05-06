"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  BookOpen, 
  Layout, 
  LogOut, 
  Users, 
  PlayCircle, 
  Clock, 
  ChevronRight,
  Search
} from 'lucide-react';

// --- Types ---
interface Course {
  id: number;
  title: string;
  slug: string;
  category: 'online' | 'offline' | 'recorded' | 'project';
  thumbnailUrl?: string;
  instructor: string;
  description?: string;
  price?: number;
}

interface Enrollment {
  id: number;
  courseId: number;
  enrolledAt: string;
  progress: number;
  status: string;
  courseTitle: string;
  thumbnailUrl?: string;
  category: string;
  instructor: string;
}

export default function StudentDashboard() {
  const [enrolledCourses, setEnrolledCourses] = useState<Enrollment[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'enrolled' | 'available'>('enrolled');

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const [enrolledRes, availableRes] = await Promise.all([
        fetch('/api/student/enrollments', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/courses?status=published', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
      ]);

      if (enrolledRes.ok) {
        const data = await enrolledRes.json();
        setEnrolledCourses(data.enrollments || []);
      }

      if (availableRes.ok) {
        const data = await availableRes.json();
        setAvailableCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Failed to fetch student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const enrollInCourse = async (courseId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/student/enroll', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId }),
      });

      if (response.ok) {
        fetchStudentData();
        setActiveTab('enrolled');
      } else {
        const error = await response.json();
        alert(error.error || 'Enrollment failed');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
    }
  };

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'recorded': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'online': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'offline': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'project': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f18] text-slate-200">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#0a0f18]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <BookOpen size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Luminous Dashboard</span>
          </div>
          
          <Link 
            href="/auth/login" 
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-white/5 hover:bg-red-500/10 hover:text-red-500 transition-all text-sm font-medium"
          >
            <LogOut size={16} />
            Sign Out
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Stats */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/50 rounded-3xl p-6 border border-white/5">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-emerald-500/20 rounded-2xl">
                  <Layout className="text-emerald-500" size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-400">Total Progress</h3>
                  <p className="text-2xl font-bold text-white">{enrolledCourses.length} Courses</p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Quick Actions</p>
                <button 
                  onClick={() => setActiveTab('available')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all group"
                >
                  <span className="text-sm font-bold">Browse Catalog</span>
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tabs */}
            <div className="flex items-center justify-between bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 w-fit">
              <button
                onClick={() => setActiveTab('enrolled')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'enrolled' 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                My Learning
              </button>
              <button
                onClick={() => setActiveTab('available')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'available' 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Explore Courses
              </button>
            </div>

            {/* List Rendering */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loader"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                </motion.div>
              ) : activeTab === 'enrolled' ? (
                <motion.div 
                  key="enrolled"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {enrolledCourses.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/30 rounded-3xl border-2 border-dashed border-white/5">
                      <p className="text-slate-500">Your learning shelf is empty.</p>
                    </div>
                  ) : (
                    enrolledCourses.map((item) => (
                      <div key={item.id} className="group bg-slate-900/50 hover:bg-slate-900 p-4 rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-all flex flex-col md:flex-row gap-6 items-center">
                        <div className="relative w-full md:w-40 h-24 rounded-2xl overflow-hidden shrink-0">
                          <img src={item.thumbnailUrl || '/placeholder.jpg'} className="w-full h-full object-cover" alt="" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <PlayCircle className="text-white" size={32} />
                          </div>
                        </div>
                        <div className="flex-1 w-full space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{item.courseTitle}</h4>
                              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                                <Clock size={12} /> Enrolled {new Date(item.enrolledAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getCategoryStyles(item.category)}`}>
                              {item.category}
                            </span>
                          </div>
                          
                          <div className="pt-2">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] font-bold text-slate-500">COURSE PROGRESS</span>
                              <span className="text-xs font-black text-emerald-500">{item.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${item.progress}%` }}
                                className="bg-emerald-500 h-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="available"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {availableCourses.map((course) => (
                    <div key={course.id} className="bg-slate-900/50 rounded-3xl border border-white/5 overflow-hidden group hover:border-emerald-500/30 transition-all flex flex-col">
                      <div className="aspect-video relative overflow-hidden">
                        <img src={course.thumbnailUrl || '/placeholder.jpg'} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                        <div className={`absolute top-4 left-4 px-3 py-1 rounded-lg text-[10px] font-black uppercase border backdrop-blur-md ${getCategoryStyles(course.category)}`}>
                          {course.category}
                        </div>
                      </div>
                      <div className="p-5 space-y-3 flex-1 flex flex-col">
                        <h4 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">{course.title}</h4>
                        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed flex-1">{course.description}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <span className="text-emerald-500 font-bold">{course.price ? `${course.price} TK` : 'FREE'}</span>
                          <button 
                            onClick={() => enrollInCourse(course.id)}
                            className="px-4 py-2 bg-slate-800 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all"
                          >
                            Enroll Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}