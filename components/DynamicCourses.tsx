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
}

export default function DynamicCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      } else {
        console.error('Failed to fetch courses');
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {courses
        .filter(course => course.status === 'published') // Only show published courses
        .map((course) => (
          <UserCourseCard 
            key={course.id} 
            course={course} 
          />
        ))}
    </div>
  );
}
