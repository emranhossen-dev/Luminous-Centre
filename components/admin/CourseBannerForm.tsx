"use client";

import React, { useState } from 'react';
import { Plus, Trash2, Upload, Play, TrendingUp, CheckSquare, Users, Award } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Feature, BannerRow, CourseBannerFormData } from '@/types/course-banner';

interface CourseBannerFormProps {
  initialData?: BannerRow;
  onSubmit: (data: CourseBannerFormData) => Promise<void>;
  onClose: () => void;
}

export default function CourseBannerForm({ initialData, onSubmit, onClose }: CourseBannerFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CourseBannerFormData>({
    banner: {
      badge: initialData?.badge || 'Online Course',
      title: initialData?.title || '',
      description: initialData?.description || '',
      pricing: {
        current: initialData?.current_price || 0,
        regular: initialData?.regular_price || 0,
        currency: initialData?.currency || 'TK'
      },
      stats: {
        classes: initialData?.classes_count || '',
        projects: initialData?.projects_count || ''
      },
      enrollment: {
        deadlineDate: initialData?.enrollment_deadline || '',
        startDate: initialData?.class_start_date || '',
        thumbnailUrl: initialData?.thumbnail_url || ''
      },
      videoSection: {
        videoUrl: initialData?.video_url || '',
        label: 'Course Preview Video'
      },
      learningOutcomes: {
        sectionTitle: 'কোর্স থেকে যা শিখবেন',
        features: initialData?.learning_outcomes || [
          { id: 1, title: 'প্রফেশনাল স্কিল', subtitle: 'ইন্ডাস্ট্রি স্ট্যান্ডার্ড', icon: 'TrendingUp' },
          { id: 2, title: 'রিয়েল প্রোজেক্ট', subtitle: '১২+ প্রোজেক্ট তৈরি', icon: 'CheckSquare' },
          { id: 3, title: 'জব প্লেসমেন্ট', subtitle: 'ক্যারিয়ার গাইডলাইন', icon: 'Users' },
          { id: 4, title: 'সার্টিফিকেট', subtitle: 'ভেরিফাইড সার্টিফিকেট', icon: 'Award' }
        ]
      }
    }
  });

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'TrendingUp': return <TrendingUp className="w-5 h-5" />;
      case 'CheckSquare': return <CheckSquare className="w-5 h-5" />;
      case 'Users': return <Users className="w-5 h-5" />;
      case 'Award': return <Award className="w-5 h-5" />;
      default: return <TrendingUp className="w-5 h-5" />;
    }
  };

  const updateFeature = (index: number, field: keyof Feature, value: string) => {
    const newFeatures = [...formData.banner.learningOutcomes.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setFormData({
      ...formData,
      banner: {
        ...formData.banner,
        learningOutcomes: {
          ...formData.banner.learningOutcomes,
          features: newFeatures
        }
      }
    });
  };

  const addFeature = () => {
    const newFeature: Feature = {
      id: Date.now(),
      title: '',
      subtitle: '',
      icon: 'TrendingUp'
    };
    setFormData({
      ...formData,
      banner: {
        ...formData.banner,
        learningOutcomes: {
          ...formData.banner.learningOutcomes,
          features: [...formData.banner.learningOutcomes.features, newFeature]
        }
      }
    });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.banner.learningOutcomes.features.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      banner: {
        ...formData.banner,
        learningOutcomes: {
          ...formData.banner.learningOutcomes,
          features: newFeatures
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
      toast.success('Course banner saved successfully! 🎉');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save course banner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-up border border-purple-500/20 shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Upload className="w-4 h-4 text-white" />
            </div>
            Course Banner Management
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Banner Info Section */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-purple-500/10">
            <h3 className="text-lg font-semibold text-purple-300 mb-4">Banner Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Badge</label>
                <input
                  type="text"
                  value={formData.banner.badge}
                  onChange={(e) => setFormData({
                    ...formData,
                    banner: { ...formData.banner, badge: e.target.value }
                  })}
                  className="w-full bg-slate-700 border border-purple-500/20 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  placeholder="Online Course"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.banner.title}
                  onChange={(e) => setFormData({
                    ...formData,
                    banner: { ...formData.banner, title: e.target.value }
                  })}
                  className="w-full bg-slate-700 border border-purple-500/20 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  placeholder="Course Title"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={formData.banner.description}
                onChange={(e) => setFormData({
                  ...formData,
                  banner: { ...formData.banner, description: e.target.value }
                })}
                className="w-full bg-slate-700 border border-purple-500/20 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 h-24 resize-none"
                placeholder="Course description"
              />
            </div>
          </div>

          {/* Pricing Section */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-purple-500/10">
            <h3 className="text-lg font-semibold text-purple-300 mb-4">Pricing</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Current Price</label>
                <input
                  type="number"
                  value={formData.banner.pricing.current}
                  onChange={(e) => setFormData({
                    ...formData,
                    banner: {
                      ...formData.banner,
                      pricing: { ...formData.banner.pricing, current: Number(e.target.value) }
                    }
                  })}
                  className="w-full bg-slate-700 border border-purple-500/20 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  placeholder="8000"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Regular Price</label>
                <input
                  type="number"
                  value={formData.banner.pricing.regular}
                  onChange={(e) => setFormData({
                    ...formData,
                    banner: {
                      ...formData.banner,
                      pricing: { ...formData.banner.pricing, regular: Number(e.target.value) }
                    }
                  })}
                  className="w-full bg-slate-700 border border-purple-500/20 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  placeholder="10000"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
                <input
                  type="text"
                  value={formData.banner.pricing.currency}
                  onChange={(e) => setFormData({
                    ...formData,
                    banner: {
                      ...formData.banner,
                      pricing: { ...formData.banner.pricing, currency: e.target.value }
                    }
                  })}
                  className="w-full bg-slate-700 border border-purple-500/20 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  placeholder="TK"
                />
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-purple-500/10">
            <h3 className="text-lg font-semibold text-purple-300 mb-4">Statistics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Classes Count</label>
                <input
                  type="text"
                  value={formData.banner.stats.classes}
                  onChange={(e) => setFormData({
                    ...formData,
                    banner: {
                      ...formData.banner,
                      stats: { ...formData.banner.stats, classes: e.target.value }
                    }
                  })}
                  className="w-full bg-slate-700 border border-purple-500/20 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  placeholder="60+"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Projects Count</label>
                <input
                  type="text"
                  value={formData.banner.stats.projects}
                  onChange={(e) => setFormData({
                    ...formData,
                    banner: {
                      ...formData.banner,
                      stats: { ...formData.banner.stats, projects: e.target.value }
                    }
                  })}
                  className="w-full bg-slate-700 border border-purple-500/20 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  placeholder="12+"
                />
              </div>
            </div>
          </div>

          {/* Enrollment Section */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-purple-500/10">
            <h3 className="text-lg font-semibold text-purple-300 mb-4">Enrollment</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Deadline Date</label>
                <input
                  type="datetime-local"
                  value={formData.banner.enrollment.deadlineDate}
                  onChange={(e) => setFormData({
                    ...formData,
                    banner: {
                      ...formData.banner,
                      enrollment: { ...formData.banner.enrollment, deadlineDate: e.target.value }
                    }
                  })}
                  className="w-full bg-slate-700 border border-purple-500/20 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                <input
                  type="datetime-local"
                  value={formData.banner.enrollment.startDate}
                  onChange={(e) => setFormData({
                    ...formData,
                    banner: {
                      ...formData.banner,
                      enrollment: { ...formData.banner.enrollment, startDate: e.target.value }
                    }
                  })}
                  className="w-full bg-slate-700 border border-purple-500/20 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Thumbnail URL</label>
              <input
                type="url"
                value={formData.banner.enrollment.thumbnailUrl}
                onChange={(e) => setFormData({
                  ...formData,
                  banner: {
                    ...formData.banner,
                    enrollment: { ...formData.banner.enrollment, thumbnailUrl: e.target.value }
                  }
                })}
                className="w-full bg-slate-700 border border-purple-500/20 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                placeholder="https://your-storage.com/video-thumb.png"
              />
            </div>
          </div>

          {/* Video Section */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-purple-500/10">
            <h3 className="text-lg font-semibold text-purple-300 mb-4">Video Section</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Video URL</label>
                <input
                  type="url"
                  value={formData.banner.videoSection.videoUrl}
                  onChange={(e) => setFormData({
                    ...formData,
                    banner: {
                      ...formData.banner,
                      videoSection: { ...formData.banner.videoSection, videoUrl: e.target.value }
                    }
                  })}
                  className="w-full bg-slate-700 border border-purple-500/20 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  placeholder="https://www.youtube.com/embed/example-id"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Label</label>
                <input
                  type="text"
                  value={formData.banner.videoSection.label}
                  onChange={(e) => setFormData({
                    ...formData,
                    banner: {
                      ...formData.banner,
                      videoSection: { ...formData.banner.videoSection, label: e.target.value }
                    }
                  })}
                  className="w-full bg-slate-700 border border-purple-500/20 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  placeholder="Course Preview Video"
                />
              </div>
            </div>
          </div>

          {/* Learning Outcomes Section */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-purple-500/10">
            <h3 className="text-lg font-semibold text-purple-300 mb-4">Learning Outcomes</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Section Title</label>
              <input
                type="text"
                value={formData.banner.learningOutcomes.sectionTitle}
                onChange={(e) => setFormData({
                  ...formData,
                  banner: {
                    ...formData.banner,
                    learningOutcomes: { ...formData.banner.learningOutcomes, sectionTitle: e.target.value }
                  }
                })}
                className="w-full bg-slate-700 border border-purple-500/20 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                placeholder="কোর্স থেকে যা শিখবেন"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-md font-medium text-gray-300">Features</h4>
                <button
                  type="button"
                  onClick={addFeature}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Feature
                </button>
              </div>

              {formData.banner.learningOutcomes.features.map((feature, index) => (
                <div key={feature.id} className="bg-slate-700/50 rounded-lg p-4 border border-purple-500/10">
                  <div className="flex justify-between items-start mb-3">
                    <h5 className="text-sm font-medium text-gray-300">Feature {index + 1}</h5>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Title</label>
                      <input
                        type="text"
                        value={feature.title}
                        onChange={(e) => updateFeature(index, 'title', e.target.value)}
                        className="w-full bg-slate-600 border border-purple-500/20 rounded-lg px-3 py-1.5 text-white text-sm focus:border-purple-500 focus:outline-none"
                        placeholder="Feature title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Subtitle</label>
                      <input
                        type="text"
                        value={feature.subtitle}
                        onChange={(e) => updateFeature(index, 'subtitle', e.target.value)}
                        className="w-full bg-slate-600 border border-purple-500/20 rounded-lg px-3 py-1.5 text-white text-sm focus:border-purple-500 focus:outline-none"
                        placeholder="Feature subtitle"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Icon</label>
                      <select
                        value={feature.icon}
                        onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                        className="w-full bg-slate-600 border border-purple-500/20 rounded-lg px-3 py-1.5 text-white text-sm focus:border-purple-500 focus:outline-none"
                      >
                        <option value="TrendingUp">TrendingUp</option>
                        <option value="CheckSquare">CheckSquare</option>
                        <option value="Users">Users</option>
                        <option value="Award">Award</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-purple-500/20">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Save Course Banner
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
