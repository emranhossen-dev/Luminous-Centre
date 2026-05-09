"use client";

import React, { useState } from 'react';
import { Edit, Trash2, Eye, Calendar, DollarSign, Play, TrendingUp } from 'lucide-react';
import { BannerRow } from '@/types/course-banner';
import CourseBannerForm from './CourseBannerForm';

interface CourseBannerCardProps {
  banner: BannerRow;
  onSubmit: (formData: any) => Promise<void>;
  onClose: () => void;
}

export default function CourseBannerCard({ banner, onSubmit, onClose }: CourseBannerCardProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEdit = () => {
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this course banner?')) {
      return;
    }

    setLoading(true);
    try {
      await onDelete(banner.id!);
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      await onUpdate(banner.id!, formData);
      setShowForm(false);
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'TrendingUp': return <TrendingUp className="w-4 h-4" />;
      case 'CheckSquare': return <Calendar className="w-4 h-4" />;
      case 'Users': return <Eye className="w-4 h-4" />;
      case 'Award': return <DollarSign className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  if (showForm) {
    return (
      <CourseBannerForm
        initialData={banner}
        onSubmit={handleSubmit}
        onClose={() => setShowForm(false)}
      />
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-purple-500/20 overflow-hidden hover:border-purple-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
      {/* Header with Badge */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-4 border-b border-purple-500/20">
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center px-3 py-1 bg-purple-500/20 rounded-full text-purple-300 text-xs font-medium mb-2">
              {banner.badge}
            </div>
            <h3 className="text-lg font-bold text-white line-clamp-2">{banner.title}</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Description */}
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">
          {banner.description}
        </p>

        {/* Pricing */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-2xl font-bold text-green-400">
              {banner.currency} {banner.current_price.toLocaleString()}
            </span>
          </div>
          {banner.regular_price > banner.current_price && (
            <span className="text-lg text-gray-400 line-through">
              {banner.currency} {banner.regular_price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-xs text-gray-400">Classes</p>
                <p className="text-sm font-semibold text-white">{banner.classes_count}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" />
              <div>
                <p className="text-xs text-gray-400">Projects</p>
                <p className="text-sm font-semibold text-white">{banner.projects_count}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Enrollment Deadline:</span>
            <span className="text-orange-400 font-medium">
              {formatDate(banner.enrollment_deadline)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Class Start:</span>
            <span className="text-green-400 font-medium">
              {formatDate(banner.class_start_date)}
            </span>
          </div>
        </div>

        {/* Learning Outcomes Preview */}
        {banner.learning_outcomes && banner.learning_outcomes.length > 0 && (
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-purple-300 mb-3">
              Learning Outcomes
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {banner.learning_outcomes.slice(0, 4).map((feature: any, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="text-purple-400">
                    {getIconComponent(feature.icon)}
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
            {banner.learning_outcomes.length > 4 && (
              <p className="text-xs text-purple-400 mt-2">
                +{banner.learning_outcomes.length - 4} more features
              </p>
            )}
          </div>
        )}

        {/* Video Preview */}
        {banner.video_url && (
          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Play className="w-4 h-4 text-red-400" />
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

      {/* Footer */}
      <div className="bg-slate-800/50 px-6 py-3 border-t border-purple-500/20">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Last updated: {formatDate(banner.updated_at)}
          </span>
          <button
            onClick={handleEdit}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
}
