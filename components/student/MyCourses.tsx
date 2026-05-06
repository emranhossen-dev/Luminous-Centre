"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star,
  Filter,
  Search,
  PlayCircle,
  Award
} from 'lucide-react';

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: string;
  price?: number;
  oldPrice?: number;
  thumbnailUrl?: string;
  instructor: string;
  duration?: string;
  level?: string;
  rating?: number;
  enrolledCount?: number;
  totalHours?: number;
  status: string;
  featured?: boolean;
}

export default function MyCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/courses?status=published', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
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
        // Refresh courses to update enrollment status
        fetchCourses();
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

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const categories = ['all', ...Array.from(new Set(courses.map(c => c.category)))];
  const levels = ['all', ...Array.from(new Set(courses.map(c => c.level).filter(Boolean)))];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 mt-4">Loading available courses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Explore Courses</h1>
        <p className="text-slate-400">Discover new skills and advance your career with our comprehensive courses.</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
          >
            {levels.map(level => (
              <option key={level} value={level}>
                {level === 'all' ? 'All Levels' : level?.charAt(0).toUpperCase() + level?.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 rounded-3xl border-2 border-dashed border-white/5">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No courses found</h3>
          <p className="text-slate-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden group hover:border-emerald-500/30 transition-all"
            >
              {/* Course Image */}
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={course.thumbnailUrl || '/placeholder.jpg'} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  alt={course.title} 
                />
                <div className={`absolute top-4 left-4 px-3 py-1 rounded-lg text-[10px] font-black uppercase border backdrop-blur-md ${getCategoryStyles(course.category)}`}>
                  {course.category}
                </div>
                {course.featured && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-amber-500 text-white rounded-lg text-[10px] font-black uppercase">
                    Featured
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <PlayCircle className="text-white" size={48} />
                </div>
              </div>

              {/* Course Content */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">by {course.instructor}</p>
                </div>

                <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                  {course.description}
                </p>

                {/* Course Meta */}
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  {course.duration && (
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      {course.duration}
                    </div>
                  )}
                  {course.level && (
                    <div className="px-2 py-1 bg-slate-800 rounded-lg">
                      {course.level}
                    </div>
                  )}
                  {course.rating && (
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-amber-500 fill-current" />
                      {course.rating}
                    </div>
                  )}
                </div>

                {/* Price and Action */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div>
                    {course.price ? (
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-500 font-bold text-lg">{course.price} TK</span>
                        {course.oldPrice && (
                          <span className="text-slate-500 text-sm line-through">{course.oldPrice} TK</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-emerald-500 font-bold text-lg">FREE</span>
                    )}
                  </div>
                  <button 
                    onClick={() => enrollInCourse(course.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2"
                  >
                    <Award size={16} />
                    Enroll Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
