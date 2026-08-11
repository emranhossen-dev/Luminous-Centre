"use client";

import React from "react";
import Image from "next/image";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

const DEFAULT_COURSES: Course[] = [
  {
    id: 101,
    title: "Web Application Development (MERN Stack)",
    slug: "web-development-mern",
    category: "Web Development",
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
    category: "Graphic Design",
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
    category: "Digital Marketing",
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
    title: "NSDA / ASSETS IT Skills Training (Government Project)",
    slug: "nsda-assets-govt-project",
    category: "Govt Project",
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

interface CourseSectionProps {
  initialCourses?: Course[];
}

const CourseSection = ({ initialCourses = [] }: CourseSectionProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = React.useState<Course[]>(initialCourses.length > 0 ? initialCourses : DEFAULT_COURSES);
  const [loading, setLoading] = React.useState(initialCourses.length === 0);

  React.useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses?limit=8');
        if (response.ok) {
          const data = await response.json();
          if (data.courses && data.courses.length > 0) {
            setCourses(data.courses);
          } else {
            setCourses(DEFAULT_COURSES);
          }
        } else {
          setCourses(DEFAULT_COURSES);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        setCourses(DEFAULT_COURSES);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleEnrollmentClick = () => {
    router.push('/courses');
  };

  const displayCourses = courses.length > 0 ? courses : DEFAULT_COURSES;

  return (
    <section className="relative w-full overflow-hidden py-10 lg:py-14">
      {/* Mixed Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#05060f] via-[#080616] to-[#0b0c17] z-0"></div>
      
      {/* Middle Glow Effects */}
      <div className="absolute top-1/2 left-0 w-full h-full overflow-hidden z-0 pointer-events-none -translate-y-1/2">
        <div className="absolute top-1/2 left-[-5%] w-[30%] h-[30%] bg-blue-600/12 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[25%] h-[25%] bg-purple-600/10 rounded-full blur-[90px] animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 right-[-5%] w-[30%] h-[30%] bg-indigo-600/12 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full px-4 md:px-8 lg:px-12 xl:px-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            Popular <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2F2FE4] to-[#60a5fa]">Courses</span>
          </h2>
          <p className="text-gray-400 font-medium text-sm md:text-base" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
            দক্ষতা অর্জন করুন আমাদের সর্বাধিক চাহিদাসম্পন্ন প্রোগ্রামগুলোর সাথে
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 mb-12">
          {displayCourses.map((course) => (
            <UserCourseCard key={course.id} course={course} />
          ))}
        </div>

        {/* View All button */}
        <div className="flex justify-center">
          <button 
            onClick={handleEnrollmentClick}
            className="group flex items-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-[#2F2FE4] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#162E93] transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-lg shadow-blue-900/30"
            style={{ fontFamily: 'var(--font-hind-siliguri)' }}
          >
            সকল কোর্স দেখুন
            <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CourseSection;