"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Trash2, Plus, Calendar, Clock, DollarSign, FileText, Image, Video, Award, Users, CheckSquare, TrendingUp } from "lucide-react";

interface CourseData {
  id: number;
  title: string;
  slug: string;
  thumbnail_url: string;
  category: string;
  price: number;
  old_price: number;
  description: string;
  short_description: string;
  access_type: string;
  status: string;
  featured: boolean;
  batch: string;
  enrollment_ends: string;
  class_starts: string;
  selected_days: string[];
  level: string;
  duration_weeks: number;
  total_hours: number;
  language: string;
  // Banner data
  banner: {
    badge: string;
    title: string;
    description: string;
    pricing: {
      current: number;
      regular: number;
      currency: string;
    };
    stats: {
      classes: string;
      projects: string;
    };
    enrollment: {
      deadlineDate: string;
      startDate: string;
      thumbnailUrl: string;
    };
    videoSection: {
      videoUrl: string;
      label: string;
    };
    learningOutcomes: {
      sectionTitle: string;
      features: Array<{
        id: number;
        title: string;
        subtitle: string;
        icon: string;
      }>;
    };
  };
}

interface CourseEditPopupProps {
  course: CourseData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCourse: CourseData) => void;
  onDelete?: (courseId: number) => void;
}

export default function CourseEditPopup({ course, isOpen, onClose, onSave, onDelete }: CourseEditPopupProps) {
  const [formData, setFormData] = useState<CourseData>(course);
  const [activeTab, setActiveTab] = useState<'basic' | 'banner' | 'schedule' | 'content'>('basic');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData(course);
  }, [course]);

  const handleInputChange = (path: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleFeatureChange = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      banner: {
        ...prev.banner,
        learningOutcomes: {
          ...prev.banner.learningOutcomes,
          features: prev.banner.learningOutcomes.features.map((feature, i) =>
            i === index ? { ...feature, [field]: value } : feature
          )
        }
      }
    }));
  };

  const addFeature = () => {
    const newFeature = {
      id: Date.now(),
      title: "",
      subtitle: "",
      icon: "Award"
    };
    
    setFormData(prev => ({
      ...prev,
      banner: {
        ...prev.banner,
        learningOutcomes: {
          ...prev.banner.learningOutcomes,
          features: [...prev.banner.learningOutcomes.features, newFeature]
        }
      }
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      banner: {
        ...prev.banner,
        learningOutcomes: {
          ...prev.banner.learningOutcomes,
          features: prev.banner.learningOutcomes.features.filter((_, i) => i !== index)
        }
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving course:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      onDelete?.(course.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121821] rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-[#1e293b]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1e293b]">
          <h2 className="text-2xl font-bold text-white">Edit Course: {formData.title}</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#1e293b]">
          {[
            { id: 'basic', label: 'Basic Info', icon: FileText },
            { id: 'banner', label: 'Banner', icon: Image },
            { id: 'schedule', label: 'Schedule', icon: Calendar },
            { id: 'content', label: 'Content', icon: Video }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#2F2FE4] text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Course Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-2 bg-[#080616] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-[#00a651]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  className="w-full px-4 py-2 bg-[#080616] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-[#00a651]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-2 bg-[#080616] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-[#00a651]"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="recorded">Recorded</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-2 bg-[#080616] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-[#00a651]"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Current Price</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-[#080616] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-[#00a651]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Regular Price</label>
                <input
                  type="number"
                  value={formData.old_price}
                  onChange={(e) => handleInputChange('old_price', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-[#080616] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-[#00a651]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 bg-[#080616] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-[#00a651]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Short Description</label>
                <textarea
                  value={formData.short_description || ''}
                  onChange={(e) => handleInputChange('short_description', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 bg-[#080616] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-[#00a651]"
                />
              </div>
            </div>
          )}

          {activeTab === 'banner' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Banner Badge</label>
                  <input
                    type="text"
                    value={formData.banner.badge}
                    onChange={(e) => handleInputChange('banner.badge', e.target.value)}
                    className="w-full px-4 py-2 bg-[#080616] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-[#00a651]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Thumbnail URL</label>
                  <input
                    type="url"
                    value={formData.thumbnail_url}
                    onChange={(e) => handleInputChange('thumbnail_url', e.target.value)}
                    className="w-full px-4 py-2 bg-[#080616] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-[#00a651]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Banner Title</label>
                <input
                  type="text"
                  value={formData.banner.title}
                  onChange={(e) => handleInputChange('banner.title', e.target.value)}
                  className="w-full px-4 py-2 bg-[#080616] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-[#00a651]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Banner Description</label>
                <textarea
                  value={formData.banner.description}
                  onChange={(e) => handleInputChange('banner.description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-[#080616] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-[#00a651]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Current Price (Banner)</label>
                  <input
                    type="number"
                    value={formData.banner.pricing.current}
                    onChange={(e) => handleInputChange('banner.pricing.current', parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-[#080616] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-[#00a651]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Regular Price (Banner)</label>
                  <input
                    type="number"
                    value={formData.banner.pricing.regular}
                    onChange={(e) => handleInputChange('banner.pricing.regular', parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-[#080616] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-[#00a651]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
                  <input
                    type="text"
                    value={formData.banner.pricing.currency}
                    onChange={(e) => handleInputChange('banner.pricing.currency', e.target.value)}
                    className="w-full px-4 py-2 bg-[#080616] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-[#00a651]"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Enrollment Deadline</label>
                <input
                  type="datetime-local"
                  value={formData.enrollment_ends ? formData.enrollment_ends.slice(0, 16) : ''}
                  onChange={(e) => handleInputChange('enrollment_ends', e.target.value)}
                  className="w-full px-4 py-2 bg-[#080616] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-[#00a651]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Class Start Date</label>
                <input
                  type="datetime-local"
                  value={formData.class_starts ? formData.class_starts.slice(0, 16) : ''}
                  onChange={(e) => handleInputChange('class_starts', e.target.value)}
                  className="w-full px-4 py-2 bg-[#080616] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-[#00a651]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Batch</label>
                <input
                  type="text"
                  value={formData.batch}
                  onChange={(e) => handleInputChange('batch', e.target.value)}
                  className="w-full px-4 py-2 bg-[#080616] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-[#00a651]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Level</label>
                <select
                  value={formData.level}
                  onChange={(e) => handleInputChange('level', e.target.value)}
                  className="w-full px-4 py-2 bg-[#080616] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-[#00a651]"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Duration (Weeks)</label>
                <input
                  type="number"
                  value={formData.duration_weeks}
                  onChange={(e) => handleInputChange('duration_weeks', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-[#080616] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-[#00a651]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Total Hours</label>
                <input
                  type="number"
                  value={formData.total_hours}
                  onChange={(e) => handleInputChange('total_hours', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-[#080616] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-[#00a651]"
                />
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Video URL</label>
                <input
                  type="url"
                  value={formData.banner.videoSection.videoUrl}
                  onChange={(e) => handleInputChange('banner.videoSection.videoUrl', e.target.value)}
                  className="w-full px-4 py-2 bg-[#080616] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-[#00a651]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Learning Outcomes Title</label>
                <input
                  type="text"
                  value={formData.banner.learningOutcomes.sectionTitle}
                  onChange={(e) => handleInputChange('banner.learningOutcomes.sectionTitle', e.target.value)}
                  className="w-full px-4 py-2 bg-[#080616] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-[#00a651]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-gray-300">Learning Features</label>
                  <button
                    onClick={addFeature}
                    className="flex items-center gap-2 bg-[#00a651] hover:bg-[#008c44] text-white px-3 py-1 rounded-lg text-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Feature
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.banner.learningOutcomes.features.map((feature, index) => (
                    <div key={feature.id} className="bg-[#080616] rounded-lg p-4 border border-[#1e293b]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-white">Feature {index + 1}</span>
                        <button
                          onClick={() => removeFeature(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Title"
                          value={feature.title}
                          onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                          className="px-3 py-2 bg-[#121821] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-[#00a651]"
                        />
                        <input
                          type="text"
                          placeholder="Subtitle"
                          value={feature.subtitle}
                          onChange={(e) => handleFeatureChange(index, 'subtitle', e.target.value)}
                          className="px-3 py-2 bg-[#121821] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-[#00a651]"
                        />
                        <select
                          value={feature.icon}
                          onChange={(e) => handleFeatureChange(index, 'icon', e.target.value)}
                          className="px-3 py-2 bg-[#121821] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-[#00a651]"
                        >
                          <option value="TrendingUp">TrendingUp</option>
                          <option value="CheckSquare">CheckSquare</option>
                          <option value="Users">Users</option>
                          <option value="Award">Award</option>
                          <option value="BookOpen">BookOpen</option>
                          <option value="Target">Target</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-[#1e293b]">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#00a651] hover:bg-[#008c44] text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
