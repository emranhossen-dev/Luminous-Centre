"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BannerRow, CourseBannerFormData } from '@/types/course-banner';
import CourseBannerForm from '@/components/admin/CourseBannerForm';

export default function CourseBannerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [banner, setBanner] = useState<BannerRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchBanner();
    }
  }, [params.id]);

  const fetchBanner = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/admin/course-banners/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch course banner');
      }

      const data = await response.json();
      setBanner(data.courseBanner);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch course banner');
      router.push('/admin/course-banners');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: CourseBannerFormData) => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/admin/course-banners/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update course banner');
      }

      toast.success('Course banner updated successfully! 🎉');
      await fetchBanner(); // Refresh data
    } catch (error: any) {
      toast.error(error.message || 'Failed to update course banner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this course banner? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/admin/course-banners/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete course banner');
      }

      toast.success('Course banner deleted successfully! 🗑️');
      router.push('/admin/course-banners');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete course banner');
    }
  };

  const handleViewLive = () => {
    if (banner?.video_url) {
      window.open(banner.video_url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!banner) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Course Banner Not Found</h2>
          <button
            onClick={() => router.push('/admin/course-banners')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Back to Course Banners
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
              onClick={() => router.push('/admin/course-banners')}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Course Banners
            </button>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleViewLive}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Eye className="w-4 h-4" />
                View Live
              </button>
              
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Course Banner Form */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 rounded-2xl border border-purple-500/20 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-6 border-b border-purple-500/20">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Save className="w-4 h-4 text-white" />
                  </div>
                  Edit Course Banner
                </h2>
              </div>
              
              <div className="p-6">
                <CourseBannerForm
                  initialData={banner}
                  onSubmit={handleSubmit}
                  onClose={() => router.push('/admin/course-banners')}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 rounded-2xl border border-purple-500/20 overflow-hidden sticky top-6">
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-6 border-b border-purple-500/20">
                <h3 className="text-lg font-bold text-white">Live Preview</h3>
              </div>
              
              <div className="p-6">
                {/* Badge */}
                <div className="inline-flex items-center px-3 py-1 bg-purple-500/20 rounded-full text-purple-300 text-xs font-medium mb-4">
                  {banner.badge}
                </div>
                
                {/* Title */}
                <h4 className="text-xl font-bold text-white mb-3">{banner.title}</h4>
                
                {/* Description */}
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                  {banner.description}
                </p>

                {/* Pricing */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl font-bold text-green-400">
                    {banner.currency} {banner.current_price.toLocaleString()}
                  </span>
                  {banner.regular_price > banner.current_price && (
                    <span className="text-lg text-gray-400 line-through">
                      {banner.currency} {banner.regular_price.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Classes</p>
                    <p className="text-sm font-semibold text-white">{banner.classes_count}</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Projects</p>
                    <p className="text-sm font-semibold text-white">{banner.projects_count}</p>
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">Enrollment Deadline:</span>
                    <span className="text-orange-400 font-medium">
                      {new Date(banner.enrollment_deadline).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">Class Start:</span>
                    <span className="text-green-400 font-medium">
                      {new Date(banner.class_start_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Learning Outcomes */}
                {banner.learning_outcomes && banner.learning_outcomes.length > 0 && (
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h5 className="text-sm font-semibold text-purple-300 mb-3">
                      Learning Outcomes
                    </h5>
                    <div className="space-y-2">
                      {banner.learning_outcomes.slice(0, 6).map((feature: any, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="text-purple-400">
                            {feature.icon === 'TrendingUp' && <div className="w-4 h-4">📈</div>}
                            {feature.icon === 'CheckSquare' && <div className="w-4 h-4">✓</div>}
                            {feature.icon === 'Users' && <div className="w-4 h-4">👥</div>}
                            {feature.icon === 'Award' && <div className="w-4 h-4">🏆</div>}
                          </div>
                          <div>
                            <p className="text-xs text-white font-medium line-clamp-1">
                              {feature.title}
                            </p>
                            <p className="text-xs text-gray-400 line-clamp-1">
                              {feature.subtitle}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Video Preview */}
                {banner.video_url && (
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-4 h-4">🎥</div>
                      <span className="text-sm font-medium text-white">Course Preview</span>
                    </div>
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      {banner.video_url.includes('youtube.com') ? (
                        <iframe
                          src={banner.video_url.replace('watch?v=', 'embed/')}
                          className="w-full h-full"
                          frameBorder="0"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={banner.video_url}
                          className="w-full h-full"
                          controls
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {submitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white">Updating course banner...</span>
          </div>
        </div>
      )}
    </div>
  );
}
