"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  PlayCircle, 
  TrendingUp, 
  Award,
  Target,
  ChevronRight,
  FileText,
  Zap,
  Sparkles,
  Flame,
  Clock
} from 'lucide-react';
import CoursePlayer from './CoursePlayer';

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

interface DashboardStats {
  userName: string;
  totalAssignments: number;
  submittedAssignments: number;
  averageMarks: number;
  totalVideos: number;
  watchedVideos: number;
  overallProgress: number;
}

export default function Dashboard() {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCourseId, setActiveCourseId] = useState<number | null>(null);
  const [activeCourseTitle, setActiveCourseTitle] = useState<string>('');
  const [stats, setStats] = useState<DashboardStats>({
    userName: 'Student',
    totalAssignments: 0,
    submittedAssignments: 0,
    averageMarks: 0,
    totalVideos: 0,
    watchedVideos: 0,
    overallProgress: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch enrolled courses and stats in parallel
      const [enrollRes, statsRes] = await Promise.all([
        fetch('/api/student/enrollments', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('/api/student/dashboard-stats', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
      ]);

      if (enrollRes.ok) {
        const data = await enrollRes.json();
        setEnrolledCourses(data.enrollments || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Dynamic welcome message based on progress
  const getWelcomeMessage = () => {
    const { overallProgress, totalVideos, watchedVideos, userName } = stats;
    const firstName = userName || 'Student';

    if (totalVideos === 0) {
      return {
        icon: <Sparkles className="w-7 h-7 text-amber-400" />,
        title: `Welcome, ${firstName}! 🎓`,
        subtitle: 'Your learning adventure begins now. Start exploring your courses!',
        gradient: 'from-amber-500/10 to-orange-500/10 border-amber-500/20'
      };
    }

    if (overallProgress >= 100) {
      return {
        icon: <Award className="w-7 h-7 text-emerald-400" />,
        title: `Outstanding, ${firstName}! 🎉`,
        subtitle: 'You\'ve completed all your modules. You\'re a star learner!',
        gradient: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20'
      };
    }

    if (overallProgress >= 70) {
      return {
        icon: <Flame className="w-7 h-7 text-orange-400" />,
        title: `Almost there, ${firstName}! 🚀`,
        subtitle: `You're ${overallProgress}% done — just ${totalVideos - watchedVideos} more lessons to go!`,
        gradient: 'from-orange-500/10 to-red-500/10 border-orange-500/20'
      };
    }

    if (overallProgress < 30 && enrolledCourses.length > 0) {
      return {
        icon: <Zap className="w-7 h-7 text-yellow-400" />,
        title: `Time to catch up, ${firstName}! ⚡`,
        subtitle: `You've only watched ${watchedVideos} of ${totalVideos} lessons. Start now to stay on track!`,
        gradient: 'from-yellow-500/10 to-amber-500/10 border-yellow-500/20'
      };
    }

    return {
      icon: <TrendingUp className="w-7 h-7 text-blue-400" />,
      title: `Great progress, ${firstName}! 💪`,
      subtitle: `You've completed ${overallProgress}% of your course material. Keep the momentum going!`,
      gradient: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20'
    };
  };

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'recorded': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'online': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'offline': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'project':
      case 'govt': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
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

  if (activeCourseId) {
    return (
      <CoursePlayer 
        courseId={activeCourseId} 
        courseTitle={activeCourseTitle} 
        onBack={() => setActiveCourseId(null)} 
      />
    );
  }

  const welcome = getWelcomeMessage();

  const statsCards = [
    {
      label: 'Assignments',
      value: `${stats.submittedAssignments}/${stats.totalAssignments}`,
      sub: 'Submitted',
      icon: FileText,
      color: 'emerald',
      bgClass: 'bg-emerald-500/20',
      iconClass: 'text-emerald-500'
    },
    {
      label: 'Avg. Marks',
      value: stats.averageMarks > 0 ? `${stats.averageMarks}%` : '—',
      sub: 'Assignment Avg',
      icon: Award,
      color: 'blue',
      bgClass: 'bg-blue-500/20',
      iconClass: 'text-blue-500'
    },
    {
      label: 'Videos Watched',
      value: `${stats.watchedVideos}/${stats.totalVideos}`,
      sub: 'Lessons',
      icon: PlayCircle,
      color: 'purple',
      bgClass: 'bg-purple-500/20',
      iconClass: 'text-purple-500'
    },
    {
      label: 'Course Progress',
      value: `${stats.overallProgress}%`,
      sub: 'Overall',
      icon: Target,
      color: 'amber',
      bgClass: 'bg-amber-500/20',
      iconClass: 'text-amber-500'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Dynamic Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-5 sm:p-6 bg-gradient-to-r ${welcome.gradient} border backdrop-blur-sm`}
      >
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-white/5 rounded-xl shrink-0 hidden sm:flex">
            {welcome.icon}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">{welcome.title}</h1>
            <p className="text-sm text-slate-400 leading-relaxed">{welcome.subtitle}</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + index * 0.05 }}
              className="bg-slate-900/50 rounded-2xl p-4 sm:p-5 border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 ${card.bgClass} rounded-xl`}>
                  <Icon className={`${card.iconClass} w-4 h-4 sm:w-5 sm:h-5`} />
                </div>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-white">{card.value}</p>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">{card.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Continue Learning Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Continue Learning</h2>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="text-center py-16 sm:py-20 bg-slate-900/30 rounded-3xl border-2 border-dashed border-white/5">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No courses yet</h3>
            <p className="text-slate-500 mb-6 text-sm">Start your learning journey by enrolling in a course</p>
            <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors">
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {enrolledCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden hover:border-emerald-500/30 transition-all group"
              >
                <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-5">
                  <div className="relative w-full sm:w-36 h-20 rounded-xl overflow-hidden shrink-0">
                    <img 
                      src={course.thumbnailUrl || '/placeholder.jpg'} 
                      className="w-full h-full object-cover" 
                      alt={course.title} 
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircle className="text-white" size={28} />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-2.5 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase border shrink-0 ${getCategoryStyles(course.category)}`}>
                        {course.category}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Progress</span>
                        <span className="text-[10px] font-black text-emerald-500">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${course.progress}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                        />
                      </div>
                    </div>

                    {/* Continue Learning Button */}
                    <button
                      onClick={() => {
                        setActiveCourseId(course.id);
                        setActiveCourseTitle(course.title);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <PlayCircle size={14} />
                      Continue Learning
                      <ChevronRight size={14} />
                    </button>
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
