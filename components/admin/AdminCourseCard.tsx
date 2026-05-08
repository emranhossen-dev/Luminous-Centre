"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wifi, WifiOff, Trash2, Edit, BookOpen } from 'lucide-react';
import CourseBannerUpdateForm from './CourseBannerUpdateForm';
import { CourseData } from '@/types/course';

interface AdminCourseCardProps {
  course: {
    id: number;
    title: string;
    slug: string;
    status: string;
    category?: string;
    access_type?: string;
  };
  onDelete: () => void;
  onStatusUpdate: (id: number, status: string) => void;
  onBannerUpdate?: () => void;
}

export default function AdminCourseCard({ course, onDelete, onStatusUpdate, onBannerUpdate }: AdminCourseCardProps) {
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [bannerData, setBannerData] = useState<CourseData | undefined>();

  // Handle card click
  const handleCardClick = () => {
    window.location.href = `/courses/${course.slug}`;
  };

  // Handle banner update
  const handleBannerUpdate = async () => {
    try {
      const response = await fetch(`/api/courses/${course.slug}`);
      if (response.ok) {
        const data = await response.json();
        setBannerData(data);
        setShowBannerForm(true);
      }
    } catch (error) {
      console.error('Failed to fetch course data:', error);
    }
  };

  const handleBannerFormClose = () => {
    setShowBannerForm(false);
    setBannerData(undefined);
  };

  const handleBannerFormSuccess = () => {
    setShowBannerForm(false);
    setBannerData(undefined);
    onBannerUpdate?.();
  };

  return (
    <div 
      className="bg-slate-800/50 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer group p-4"
      onClick={handleCardClick}
    >
      {/* Header with Status Badges */}
      <div className="flex items-center justify-between mb-4">
        {/* Online/Offline Status - Top Left */}
        <div className="flex items-center gap-2">
          {(course.category?.toLowerCase() === 'online' || course.access_type === 'online') ? (
            <div className="flex items-center gap-1 px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full border border-blue-500/30">
              <Wifi className="w-3 h-3" />
              <span className="text-xs font-medium">Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-3 py-1 bg-green-600/20 text-green-400 rounded-full border border-green-500/30">
              <WifiOff className="w-3 h-3" />
              <span className="text-xs font-medium">Offline</span>
            </div>
          )}
        </div>

        {/* Published/Draft Status - Top Right */}
        <div className="flex items-center gap-2">
          {course.status === 'published' ? (
            <span className="px-3 py-1 bg-emerald-600/20 text-emerald-400 rounded-full border border-emerald-500/30 text-xs font-medium">
              Published
            </span>
          ) : (
            <span className="px-3 py-1 bg-slate-600/20 text-slate-400 rounded-full border border-slate-500/30 text-xs font-medium">
              Draft
            </span>
          )}
        </div>
      </div>

      {/* Course Title */}
      <h3 className="text-lg font-bold text-white mb-6 line-clamp-2 group-hover:text-emerald-400 transition-colors">
        {course.title}
      </h3>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {course.status === 'draft' ? (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onStatusUpdate(course.id, 'published');
            }}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors text-sm font-medium"
          >
            Publish
          </button>
        ) : (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onStatusUpdate(course.id, 'draft');
            }}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-500 transition-colors text-sm font-medium"
          >
            Unpublish
          </button>
        )}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleBannerUpdate();
          }}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium"
        >
          <Edit className="w-4 h-4" />
          Banner
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = `/admin/courses/${course.slug}/update`;
          }}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors text-sm font-medium"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors text-sm font-medium"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>

      {/* Banner Update Form Modal */}
      {showBannerForm && (
        <CourseBannerUpdateForm
          courseSlug={course.slug}
          initialData={bannerData}
          onClose={handleBannerFormClose}
          onSuccess={handleBannerFormSuccess}
        />
      )}

      </div>
  );
}
