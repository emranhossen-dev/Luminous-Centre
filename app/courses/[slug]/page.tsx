'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import CourseBanner from '@/components/CourseBanner';
import BestSpinner from '@/components/BestSpinner';
import { useLoading } from '@/contexts/LoadingContext';
import { CourseData } from '@/types/course';
import CourseCurriculum from '../components/CourseCurriculum';

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [course, setCourse] = useState<CourseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/courses/${slug}`);
        
        if (!response.ok) {
          throw new Error('Course not found');
        }
        
        const courseData = await response.json();
        setCourse(courseData);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    if (slug && !course) {
      fetchCourseDetails();
    }
  }, [slug, course]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <BestSpinner size="large" color="#ffffff" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-white text-3xl font-bold mb-4">Course Not Found</h1>
          <p className="text-gray-400 mb-8">{error || 'The course you are looking for does not exist.'}</p>
          <a 
            href="/courses" 
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Browse All Courses
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Course Banner */}
      <CourseBanner course={course} />
      
      {/* Course Curriculum Section */}
      <CourseCurriculum 
        curriculum={course.curriculum || []} 
        subtitle={course.curriculum_subtitle} 
      />
    </div>
  );
}
