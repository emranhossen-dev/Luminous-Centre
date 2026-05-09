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
    <main className="min-h-screen bg-gray-50 pt-32 pb-20 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500 rounded-full mix-blend-screen filter blur-[150px] opacity-10"></div>
      
      <div className="container mx-auto px-6 relative z-10">
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
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-[#2F2FE4] focus:outline-none"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-[#2F2FE4] focus:outline-none"
        >
          <option value="popular">Most Popular</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
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
              className="group glass rounded-[2.5rem] overflow-hidden border-white/5 hover:border-[#2F2FE4]/50 transition-all"
            >
              {/* Course Image */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={course.thumbnail_url || "https://i.ibb.co.com/35332p83/preview.png"}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-[#2F2FE4] text-white text-xs font-bold rounded-full">
                    {course.category}
                  </span>
                </div>
              </div>

              {/* Course Content */}
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-white group-hover:text-[#60a5fa] transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2">{course.short_description || course.description}</p>
                </div>

                {/* Course Meta */}
                <div className="flex items-center gap-4 text-sm text-gray-400">
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

                {/* Instructor placeholder */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#2F2FE4]/20 flex items-center justify-center">
                    <Award size={16} className="text-[#60a5fa]" />
                  </div>
                  <span className="text-sm text-gray-300">Professional Mentor</span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div>
                    {course.price === 0 ? (
                      <span className="text-2xl font-black text-emerald-400">FREE</span>
                    ) : (
                      <div>
                        <span className="text-2xl font-black text-white">৳{course.price}</span>
                        {course.old_price > course.price && (
                          <span className="text-sm text-gray-500 line-through ml-2">৳{course.old_price}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/courses/${course.slug}`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* No Results */}
      {sortedCourses.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">No courses found matching your search.</p>
        </div>
      )}
      </div>
      </main>
  );
}
