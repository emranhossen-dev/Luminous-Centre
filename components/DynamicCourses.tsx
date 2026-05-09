"use client";

import React, { useState, useEffect } from "react";
import UserCourseCard from "@/components/UserCourseCard";

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
  selected_days?: string[];
  course_outline_url?: string;
}

interface DynamicCoursesProps {
  category?: string;
}

export default function DynamicCourses({ category }: DynamicCoursesProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, [category]);

  const fetchCourses = async () => {
    try {
      let url = '/api/courses?limit=100';
      if (category && category !== 'all') {
        url += `&category=${category}`;
      }
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log('DynamicCourses - Fetched courses:', {
          category,
          url,
          count: data.courses?.length || 0,
          total: data.pagination?.total || 0,
          courses: data.courses?.slice(0, 5).map(c => ({
            id: c.id,
            title: c.title,
            category: c.category,
            status: c.status
          }))
        });
        setCourses(data.courses || []);
      } else {
        console.error('Failed to fetch courses:', response.status);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <h3 className="text-xl font-semibold mb-2">No courses available</h3>
        <p>Check back later for new courses!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10">
      {courses
        .map((course) => (
          <UserCourseCard 
            key={course.id} 
            course={course} 
          />
        ))}
    </div>
  );
}
