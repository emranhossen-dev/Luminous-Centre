"use client";

import React, { useState, useEffect } from "react";
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
  selected_days?: string[];
  course_outline_url?: string;
}

const DEFAULT_COURSES: Course[] = [
  {
    id: 101,
    title: "Web Application Development (MERN Stack)",
    slug: "web-development-mern",
    category: "recorded",
    price: 8000,
    old_price: 12000,
    status: "published",
    level: "Beginner to Advanced",
    duration_weeks: 20,
    total_hours: 75,
    enrollmentCount: 142,
    featured: true,
    thumbnail_url: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?q=80&w=800&auto=format&fit=crop",
    short_description: "HTML, CSS, JavaScript, React.js, Next.js, Node.js & PostgreSQL/MongoDB."
  },
  {
    id: 102,
    title: "Creative Graphic & UI/UX Design",
    slug: "graphic-design-uiux",
    category: "online",
    price: 6000,
    old_price: 9000,
    status: "published",
    level: "Beginner to Professional",
    duration_weeks: 16,
    total_hours: 48,
    enrollmentCount: 98,
    featured: true,
    thumbnail_url: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800&auto=format&fit=crop",
    short_description: "Photoshop, Illustrator, Figma, Brand Identity & UI Layouts."
  },
  {
    id: 103,
    title: "Digital Marketing & Social Media Strategy",
    slug: "digital-marketing-seo",
    category: "offline",
    price: 5000,
    old_price: 8000,
    status: "published",
    level: "All Levels",
    duration_weeks: 12,
    total_hours: 36,
    enrollmentCount: 115,
    featured: true,
    thumbnail_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
    short_description: "SEO, Meta Facebook Ads, Google Ads, Copywriting & Web Analytics."
  },
  {
    id: 104,
    title: "NSDA / ASSETS IT Skills Training",
    slug: "nsda-assets-govt-project",
    category: "govt",
    price: 0,
    old_price: 0,
    status: "published",
    level: "Beginner",
    duration_weeks: 12,
    total_hours: 45,
    enrollmentCount: 320,
    featured: true,
    thumbnail_url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop",
    short_description: "Government Free IT Skills Training with Official NSDA Certification."
  }
];

interface DynamicCoursesProps {
  category?: string;
}

export default function DynamicCourses({ category }: DynamicCoursesProps) {
  const [courses, setCourses] = useState<Course[]>(DEFAULT_COURSES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, [category]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      let url = '/api/courses?limit=100';
      if (category && category !== 'all') {
        url += `&category=${category}`;
      }
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        if (data.courses && data.courses.length > 0) {
          setCourses(data.courses);
        } else {
          setCourses(filterDefaultCourses(category));
        }
      } else {
        setCourses(filterDefaultCourses(category));
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses(filterDefaultCourses(category));
    } finally {
      setLoading(false);
    }
  };

  const filterDefaultCourses = (cat?: string) => {
    if (!cat || cat === 'all') return DEFAULT_COURSES;
    const filtered = DEFAULT_COURSES.filter(c => c.category === cat);
    return filtered.length > 0 ? filtered : DEFAULT_COURSES;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <BestSpinner size="large" color="#ffffff" />
      </div>
    );
  }

  const displayCourses = courses.length > 0 ? courses : filterDefaultCourses(category);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
      {displayCourses.map((course) => (
        <UserCourseCard 
          key={course.id} 
          course={course} 
        />
      ))}
    </div>
  );
}
