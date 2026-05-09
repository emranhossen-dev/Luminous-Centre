"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Course } from '@/types/course';
import { BannerRow, CourseBannerFormData } from '@/types/course-banner';
import CourseBannerForm from '@/components/admin/CourseBannerForm';

export default function CourseDetailsUpdatePage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [banner, setBanner] = useState<BannerRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'course' | 'banner'>('course');

  useEffect(() => {
    if (params.courseId) {
      fetchCourseData();
    }
  }, [params.courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch course data
      const courseResponse = await fetch(`/api/admin/courses/${params.courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!courseResponse.ok) {
        throw new Error('Failed to fetch course data');
      }

      const courseData = await courseResponse.json();
      setCourse(courseData.course);

      // Try to fetch banner data (might not exist)
      try {
        const bannerResponse = await fetch(`/api/admin/course-banners`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (bannerResponse.ok) {
          const bannerData = await bannerResponse.json();
          // Find banner for this course (you might need to associate banners with courses)
          const courseBanner = bannerData.courseBanners?.find((b: BannerRow) => b.course_id === Number(params.courseId));
          if (courseBanner) {
            setBanner(courseBanner);
          }
        }
      } catch (bannerError) {
        console.log('No banner found for this course:', bannerError);
      }

    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch course data');
      router.push('/admin/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleBannerSubmit = async (formData: CourseBannerFormData) => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Create or update banner
      const url = banner?.id 
        ? `/api/admin/course-banners/${banner.id}`
        : '/api/admin/course-banners';

      const response = await fetch(url, {
        method: banner?.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          course_id: Number(params.courseId) // Associate banner with this course
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save course banner');
      }

      const data = await response.json();
      toast.success('Course banner saved successfully! 🎉');
      setBanner(data.courseBanner);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save course banner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBannerDelete = async () => {
    if (!banner?.id || !confirm('Are you sure you want to delete this course banner? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/admin/course-banners/${banner.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete course banner');
      }

      toast.success('Course banner deleted successfully! 🗑️');
      setBanner(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete course banner');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Course Not Found</h2>
          <button
            onClick={() => router.push('/admin/courses')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/admin/courses')}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Courses
            </button>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('course')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'course' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                Course Details
              </button>
              <button
                onClick={() => setActiveTab('banner')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'banner' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                Course Banner
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Course Info */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 rounded-2xl border border-purple-500/20 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-6 border-b border-purple-500/20">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Save className="w-4 h-4 text-white" />
                  </div>
                  {course.title}
                </h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <p className={`font-medium ${
                      course.status === 'published' ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {course.status === 'published' ? 'Published' : 'Draft'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Category</p>
                    <p className="font-medium text-white">{course.category}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Access Type</p>
                    <p className="font-medium text-white">{course.access_type}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Slug</p>
                    <p className="font-medium text-white">{course.slug}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Banner Form */}
          <div className="lg:col-span-2">
            {activeTab === 'banner' ? (
              <div className="bg-slate-800/50 rounded-2xl border border-purple-500/20 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-6 border-b border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Save className="w-4 h-4 text-white" />
                      </div>
                      Course Banner Management
                    </h2>
                    
                    {banner && (
                      <button
                        onClick={handleBannerDelete}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Banner
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="p-6">
                  <CourseBannerForm
                    initialData={banner || undefined}
                    onSubmit={handleBannerSubmit}
                    onClose={() => setActiveTab('course')}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/50 rounded-2xl border border-purple-500/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Course Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Description</p>
                    <p className="text-white">{course.description || 'No description available'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Price</p>
                    <p className="text-white">{course.price ? `TK ${course.price}` : 'Not set'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Created</p>
                    <p className="text-white">{new Date(course.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {submitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white">Saving course banner...</span>
          </div>
        </div>
      )}
    </div>
  );
}
