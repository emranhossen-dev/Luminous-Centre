"use client";

import React from 'react';
import { Wifi, WifiOff, Trash2 } from 'lucide-react';

interface CourseCardProps {
  course: {
    id: number;
    title: string;
    slug: string;
    status: string;
    category?: string;
    access_type?: string;
  };
  onDelete?: () => void;
  onStatusUpdate?: (status: string) => void;
}

export default function CourseCard({ course, onDelete, onStatusUpdate }: CourseCardProps) {
  // Handle card click
  const handleCardClick = () => {
    window.location.href = `/courses/${course.slug}`;
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
      <div className="flex gap-2">
        {course.status === 'draft' ? (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onStatusUpdate?.('published');
            }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors text-sm font-medium"
          >
            Publish
          </button>
        ) : (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onStatusUpdate?.('draft');
            }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-500 transition-colors text-sm font-medium"
          >
            Unpublish
          </button>
        )}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors text-sm font-medium"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  );
}
