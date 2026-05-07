'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Save, X, Plus, Trash2, Upload } from 'lucide-react';
import { CourseData, LearningOutcome } from '@/types/course';

interface CourseBannerUpdateFormProps {
  courseSlug: string;
  initialData?: CourseData;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CourseBannerUpdateForm({ 
  courseSlug, 
  initialData, 
  onClose, 
  onSuccess 
}: CourseBannerUpdateFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CourseData>({
    badge: 'Online Course',
    title: '',
    description: '',
    current_price: 0,
    regular_price: 0,
    currency: 'TK',
    classes_count: '60+',
    projects_count: '12+',
    enrollment_deadline: '',
    class_start_date: '',
    thumbnail_url: '',
    video_url: '',
    learning_outcomes: [
      { title: 'প্রফেশনাল স্কিল', subtitle: 'ইন্ডাস্ট্রি স্ট্যান্ডার্ড', icon: 'TrendingUp' },
      { title: 'রিয়েল প্রোজেক্ট', subtitle: '12+ প্রোজেক্ট তৈরি', icon: 'CheckSquare' }
    ]
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleLearningOutcomeChange = (index: number, field: keyof LearningOutcome, value: string) => {
    setFormData(prev => ({
      ...prev,
      learning_outcomes: prev.learning_outcomes.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addLearningOutcome = () => {
    setFormData(prev => ({
      ...prev,
      learning_outcomes: [...prev.learning_outcomes, { 
        title: '', 
        subtitle: '', 
        icon: 'CheckSquare' 
      }]
    }));
  };

  const removeLearningOutcome = (index: number) => {
    setFormData(prev => ({
      ...prev,
      learning_outcomes: prev.learning_outcomes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/courses/${courseSlug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update course banner');
      }

      toast.success('Course banner updated successfully! 🎉');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update course banner. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#0f172a] border-b border-slate-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Update Course Banner</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Badge</label>
                <select
                  name="badge"
                  value={formData.badge}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 transition-colors"
                >
                  <option value="Online Course">Online Course</option>
                  <option value="Offline Course">Offline Course</option>
                  <option value="Recorded Course">Recorded Course</option>
                  <option value="Course">Course</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Currency</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 transition-colors"
                >
                  <option value="TK">TK</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Course Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 transition-colors"
                placeholder="Enter course title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 transition-colors resize-none"
                placeholder="Enter course description"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
              Pricing
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Current Price</label>
                <input
                  type="number"
                  name="current_price"
                  value={formData.current_price}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 transition-colors"
                  placeholder="8000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Regular Price</label>
                <input
                  type="number"
                  name="regular_price"
                  value={formData.regular_price}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 transition-colors"
                  placeholder="10000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Classes Count</label>
                <input
                  type="text"
                  name="classes_count"
                  value={formData.classes_count}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 transition-colors"
                  placeholder="60+"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Projects Count</label>
                <input
                  type="text"
                  name="projects_count"
                  value={formData.projects_count}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 transition-colors"
                  placeholder="12+"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
              Important Dates
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Enrollment Deadline</label>
                <input
                  type="datetime-local"
                  name="enrollment_deadline"
                  value={formData.enrollment_deadline}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Class Start Date</label>
                <input
                  type="datetime-local"
                  name="class_start_date"
                  value={formData.class_start_date}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
              Media
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Thumbnail URL</label>
              <input
                type="url"
                name="thumbnail_url"
                value={formData.thumbnail_url}
                onChange={handleChange}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 transition-colors"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Video URL</label>
              <input
                type="url"
                name="video_url"
                value={formData.video_url}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 transition-colors"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          </div>

          {/* Learning Outcomes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
              Learning Outcomes
            </h3>
            
            <div className="space-y-4">
              {formData.learning_outcomes.map((outcome, index) => (
                <div key={index} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Title</label>
                      <input
                        type="text"
                        value={outcome.title}
                        onChange={(e) => handleLearningOutcomeChange(index, 'title', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 transition-colors"
                        placeholder="প্রফেশনাল স্কিল"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Subtitle</label>
                      <input
                        type="text"
                        value={outcome.subtitle}
                        onChange={(e) => handleLearningOutcomeChange(index, 'subtitle', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 transition-colors"
                        placeholder="ইন্ডাস্ট্রি স্ট্যান্ডার্ড"
                      />
                    </div>
                    
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-400 mb-2">Icon</label>
                        <select
                          value={outcome.icon}
                          onChange={(e) => handleLearningOutcomeChange(index, 'icon', e.target.value)}
                          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 transition-colors"
                        >
                          <option value="TrendingUp">TrendingUp</option>
                          <option value="CheckSquare">CheckSquare</option>
                          <option value="Users">Users</option>
                          <option value="Award">Award</option>
                        </select>
                      </div>
                      
                      {formData.learning_outcomes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLearningOutcome(index)}
                          className="p-2 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addLearningOutcome}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
              >
                <Plus size={20} />
                Add Learning Outcome
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
