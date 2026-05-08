'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Save, ArrowLeft, Upload, Calendar, DollarSign, BookOpen, Users, Award } from 'lucide-react';
import { CourseData, LearningOutcome } from '@/types/course';
import CourseDetailsUpdateForm from '@/components/admin/CourseDetailsUpdateForm';

export default function CourseUpdatePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await fetch(`/api/courses/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setCourseData(data);
        } else {
          toast.error('Failed to load course data');
          router.push('/admin/courses');
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
        toast.error('Failed to load course data');
        router.push('/admin/courses');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCourseData();
    }
  }, [slug, router]);

  const handleFormSuccess = () => {
    toast.success('Course details updated successfully! 🎉');
    router.push('/admin/courses');
  };

  const handleBack = () => {
    router.push('/admin/courses');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-white text-xl">Loading course data...</div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-white text-3xl font-bold mb-4">Course Not Found</h1>
          <p className="text-gray-400 mb-8">The course you are looking for does not exist.</p>
          <button 
            onClick={handleBack}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                Back to Courses
              </button>
              <div className="text-white">
                <h1 className="text-xl font-bold">Update Course Details</h1>
                <p className="text-slate-400 text-sm">{courseData.title}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <CourseDetailsUpdateForm
          courseSlug={slug}
          initialData={courseData}
          onClose={handleBack}
          onSuccess={handleFormSuccess}
        />
      </div>
    </div>
  );
}
