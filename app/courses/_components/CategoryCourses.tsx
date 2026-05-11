"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Clock, 
  Users, 
  Star, 
  Calendar, 
  Play, 
  Award,
  Filter,
  Search
} from "lucide-react";

interface Course {
  id: number;
  title: string;
  description: string;
  short_description: string;
  category: string;
  price: number;
  old_price: number;
  duration_weeks: number;
  enrollmentCount: number;
  thumbnail_url: string;
  level: string;
  slug: string;
}

interface CategoryCoursesProps {
  category: string;
}

export default function CategoryCourses({ category }: CategoryCoursesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        let url = `/api/courses?limit=50`;
        if (category !== 'all') {
          url += `&category=${category}`;
        }
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          console.log('CategoryCourses - Fetched courses:', {
            category,
            url,
            count: data.courses?.length || 0,
            courses: data.courses?.slice(0, 2).map(c => ({
              id: c.id,
              title: c.title,
              category: c.category
            }))
          });
          setCourses(data.courses);
        }
      } catch (error) {
        console.error('Failed to fetch category courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [category]);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "popular":
      default:
        return (b.enrollmentCount || 0) - (a.enrollmentCount || 0);
    }
  });

  return (
    <div className="relative z-10">
      {/* Category Navigation */}
      <div className="flex flex-wrap gap-4 items-center justify-between mb-8">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "All Courses", href: "/courses" },
            { id: "online", label: "Online Live", href: "/courses/online" },
            { id: "offline", label: "Offline", href: "/courses/offline" },
            { id: "recorded", label: "Recorded", href: "/courses/recorded" },
            { id: "govt", label: "Govt Free", href: "/courses/govt" }
          ].map((tab) => (
            <Link
              key={tab.id}
              href={tab.href}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                category === tab.id
                  ? "bg-[#2F2FE4] text-white"
                  : "bg-slate-800/50 border border-white/5 text-gray-300 hover:border-[#2F2FE4]/30"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-800/50 border border-white/5 text-white placeholder-gray-400 focus:border-[#2F2FE4]/30 focus:outline-none"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-6 py-4 rounded-2xl bg-slate-800/50 border border-white/5 text-white focus:border-[#2F2FE4]/30 focus:outline-none"
        >
          <option value="popular">Most Popular</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 gap-4">
            <div className="w-12 h-12 border-4 border-[#2F2FE4] border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold tracking-widest text-sm">Syncing Courses...</p>
          </div>
        ) : sortedCourses.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400">
            <p className="text-lg">No courses found matching your search.</p>
          </div>
        ) : (
          sortedCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-slate-800/50 rounded-xl border border-white/5 hover:border-[#2F2FE4]/30 transition-all cursor-pointer group p-4"
              onClick={() => window.location.href = `/courses/${course.slug}`}
            >
              {/* Header with Status Badges */}
              <div className="flex items-center justify-between mb-4">
                {/* Online/Offline Status - Top Left */}
                <div className="flex items-center gap-2">
                  {(course.category?.toLowerCase() === 'online' || course.category?.toLowerCase() === 'recorded') ? (
                    <div className="flex items-center gap-1 px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full border border-blue-500/30">
                      <Clock size={12} />
                      <span className="text-xs font-medium">Online</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-3 py-1 bg-green-600/20 text-green-400 rounded-full border border-green-500/30">
                      <Users size={12} />
                      <span className="text-xs font-medium">Offline</span>
                    </div>
                  )}
                </div>

                {/* Price Status - Top Right */}
                <div className="flex items-center gap-2">
                  {course.price === 0 ? (
                    <span className="px-3 py-1 bg-emerald-600/20 text-emerald-400 rounded-full border border-emerald-500/30 text-xs font-medium">
                      Free
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-600/20 text-yellow-400 rounded-full border border-yellow-500/30 text-xs font-medium">
                      ৳{course.price}
                    </span>
                  )}
                </div>
              </div>

              {/* Course Title */}
              <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-[#2F2FE4] transition-colors">
                {course.title}
              </h3>

              {/* Course Description */}
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {course.short_description || course.description}
              </p>

              {/* Course Meta */}
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{course.duration_weeks} Weeks</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  <span>{course.enrollmentCount || 0}+</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span>4.8</span>
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#2F2FE4] text-white rounded-lg hover:bg-[#2F2FE4]/80 transition-colors text-sm font-medium">
                View Details
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* No Results */}
      {sortedCourses.length === 0 && !loading && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">No courses found matching your search.</p>
        </div>
      )}
    </div>
  );
}
