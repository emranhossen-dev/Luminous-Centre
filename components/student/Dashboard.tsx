"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  PlayCircle, 
  Clock, 
  TrendingUp, 
  Calendar,
  Award,
  Target,
  ChevronRight
} from 'lucide-react';

interface Course {
  id: number;
  title: string;
  slug: string;
  thumbnailUrl?: string;
  instructor: string;
  description?: string;
  progress: number;
  enrolledAt: string;
  nextClass?: string;
  totalModules: number;
  completedModules: number;
  category: string;
}

export default function Dashboard() {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    averageProgress: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/student/enrollments', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const courses = data.enrollments || [];
        setEnrolledCourses(courses);
        
        // Calculate stats
        const totalCourses = courses.length;
        const completedCourses = courses.filter((c: Course) => c.progress === 100).length;
        const averageProgress = totalCourses > 0 
          ? Math.round(courses.reduce((acc: number, c: Course) => acc + c.progress, 0) / totalCourses)
          : 0;

        setStats({
          totalCourses,
          completedCourses,
          totalHours: 0, // Calculate from actual data if available
          averageProgress
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 mt-4">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back to your learning journey!</h1>
        <p className="text-slate-400">Continue where you left off or explore new opportunities.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/50 rounded-2xl p-6 border border-white/5"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <BookOpen className="text-emerald-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Active Courses</p>
              <p className="text-2xl font-bold text-white">{stats.totalCourses}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/50 rounded-2xl p-6 border border-white/5"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Award className="text-blue-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Completed</p>
              <p className="text-2xl font-bold text-white">{stats.completedCourses}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/50 rounded-2xl p-6 border border-white/5"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <TrendingUp className="text-purple-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Avg Progress</p>
              <p className="text-2xl font-bold text-white">{stats.averageProgress}%</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900/50 rounded-2xl p-6 border border-white/5"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/20 rounded-xl">
              <Target className="text-amber-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Learning Hours</p>
              <p className="text-2xl font-bold text-white">{stats.totalHours}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Continue Learning Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Continue Learning</h2>
          <button className="text-emerald-500 hover:text-emerald-400 text-sm font-medium flex items-center gap-1">
            View All
            <ChevronRight size={16} />
          </button>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 rounded-3xl border-2 border-dashed border-white/5">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No courses yet</h3>
            <p className="text-slate-500 mb-6">Start your learning journey by enrolling in a course</p>
            <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors">
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {enrolledCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden hover:border-emerald-500/30 transition-all group"
              >
                <div className="flex flex-col md:flex-row gap-6 p-6">
                  <div className="relative w-full md:w-40 h-24 rounded-xl overflow-hidden shrink-0">
                    <img 
                      src={course.thumbnailUrl || '/placeholder.jpg'} 
                      className="w-full h-full object-cover" 
                      alt={course.title} 
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <PlayCircle className="text-white" size={32} />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                          <Clock size={14} />
                          Enrolled {new Date(course.enrolledAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getCategoryStyles(course.category)}`}>
                        {course.category}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">PROGRESS</span>
                        <span className="text-xs font-black text-emerald-500">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${course.progress}%` }}
                          className="bg-emerald-500 h-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                        />
                      </div>
                      <p className="text-xs text-slate-500">
                        {course.completedModules} of {course.totalModules} modules completed
                      </p>
                    </div>

                    {course.nextClass && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar size={14} />
                        <span>Next class: {new Date(course.nextClass).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
