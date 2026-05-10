"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link"; // [REQUIRED] Import Link for navigation
import { Star, Users, Radio, MoveRight, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import UserCourseCard from "./UserCourseCard";

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
  description?: string;
  short_description?: string;
  language?: string;
  access_type?: string;
  course_outline_url?: string;
}

interface CourseSectionProps {
  initialCourses?: Course[];
}

const CourseSection = ({ initialCourses = [] }: CourseSectionProps) => {
  const { user, openModal } = useAuth();
  const [courses, setCourses] = React.useState<Course[]>(initialCourses);
  const [loading, setLoading] = React.useState(initialCourses.length === 0);

  React.useEffect(() => {
    // If we already have courses from SSR, don't show loading and don't re-fetch unless empty
    if (initialCourses.length > 0) {
        setLoading(false);
        return;
    }

    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses?limit=8');
        if (response.ok) {
          const data = await response.json();
          console.log('Courses fetched:', data);
          setCourses(data.courses || []);
        } else {
          console.error('API response not ok:', response.status);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleEnrollmentClick = () => {
    // Allow both logged-in and unlogged-in users to access courses
    window.location.href = '/courses';
  };

  const handleCourseViewClick = (courseSlug: string) => {
    window.location.href = `/courses/${courseSlug}`;
  };

  return (
    <section className="relative w-full overflow-hidden py-16 lg:py-24">
      {/* Mixed Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#05060f] via-[#080616] to-[#0b0c17] z-0"></div>
      
      {/* Middle Glow Effects */}
      <div className="absolute top-1/2 left-0 w-full h-full overflow-hidden z-0 pointer-events-none -translate-y-1/2">
        <div className="absolute top-1/2 left-[-5%] w-[30%] h-[30%] bg-blue-600/12 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[25%] h-[25%] bg-purple-600/10 rounded-full blur-[90px] animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 right-[-5%] w-[30%] h-[30%] bg-indigo-600/12 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            Popular <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2F2FE4] to-[#60a5fa]">Courses</span>
          </h2>
          <p className="text-gray-500 font-medium text-base md:text-lg">Invest in yourself with our most in-demand programs</p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10 mb-16 px-4">
          {loading ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-500 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
              <p className="font-bold uppercase tracking-widest text-sm">Syncing latest courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-500 border border-dashed border-white/10 rounded-3xl">
              <p className="font-bold">No courses available at the moment.</p>
              <p className="text-sm mt-2">Please check back later or contact support.</p>
            </div>
          ) : (
            courses.map((course) => (
              <UserCourseCard key={course.id} course={course} />
            ))
          )}
        </div>

        {/* View All button */}
        <div className="flex justify-center">
          <button 
            onClick={handleEnrollmentClick}
            className="group flex items-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-[#2F2FE4] text-white rounded-xl text-sm font-bold hover:bg-[#162E93] transition-all transform hover:-translate-y-0.5 active:scale-95"
          >
            কোর্সগুলো দেখুন
            <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default CourseSection;