"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import UserCourseCard from "@/components/UserCourseCard";
import BestSpinner from "@/components/BestSpinner";

interface Course {
  id: number;
  title: string;
  slug: string;
  thumbnail_url?: string;
  category: string;
  price: number;
  old_price?: number;
  status: string;
  level: string;
  duration_weeks?: number;
  total_hours?: number;
  enrollmentCount?: number;
  featured?: boolean;
  batch?: string;
  created_at?: string;
  enrollment_ends?: string;
  class_starts?: string;
  description?: string;
  short_description?: string;
  language?: string;
  access_type?: string;
  course_outline_url?: string;
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 gap-4">
            <BestSpinner size="large" color="#ffffff" />
            <p className="font-bold tracking-widest text-sm">Syncing Courses...</p>
          </div>
        ) : sortedCourses.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400">
            <p className="text-lg">No courses found matching your search.</p>
          </div>
        ) : (
          sortedCourses.map((course) => (
            <UserCourseCard 
              key={course.id} 
              course={course} 
            />
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
