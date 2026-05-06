"use client";

import React from 'react';
import { Users } from 'lucide-react';
import { Course } from '@/types/course';

interface CourseCardProps {
  course: Course;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusUpdate?: (status: string) => void;
}

export default function CourseCard({ course, onEdit, onDelete, onStatusUpdate }: CourseCardProps) {
  const discountPercentage = course.old_price > course.price 
    ? Math.round(((course.old_price - course.price) / course.old_price) * 100)
    : 0;

  return (
    <div className="max-w-[380px] bg-[#1a2332] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group transition-all duration-300 hover:border-emerald-500/30">
      {/* Thumbnail Section */}
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={course.thumbnail_url} 
          alt={course.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-course.jpg';
          }}
        />
        <div className="absolute top-3 left-3 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider shadow-lg">
          {course.category}
        </div>
        {course.status === 'published' && (
          <div className="absolute top-3 right-3 bg-green-600 text-white text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider shadow-lg">
            Published
          </div>
        )}
        {course.featured && (
          <div className="absolute bottom-3 left-3 bg-yellow-600 text-white text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider shadow-lg">
            Featured
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-4">
        <div className="flex justify-between items-center">
          {/* Dynamic Batch Ribbon */}
          <div className="bg-[#065f46] text-[#34d399] text-[11px] font-bold px-3 py-1 rounded-sm relative">
            {course.batch}
            <div className="absolute top-0 -right-2 border-y-[12px] border-y-transparent border-l-[8px] border-l-[#065f46]"></div>
          </div>
          
          {/* Rating & Social Proof */}
          <div className="flex items-center gap-1 text-yellow-500">
            <span className="text-[12px] font-bold text-slate-300 mr-1">4.8</span>
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
            ))}
            <span className="text-slate-500 text-[11px] ml-1">(80)</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-100 leading-snug min-h-[56px] line-clamp-2">
          {course.title}
        </h3>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-slate-400 text-sm border-t border-slate-800 pt-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse shadow-[0_0_8px_rgba(236,72,153,0.6)]"></div>
            <span>Live</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={16} className="text-slate-500" />
            <span>{course.enrollmentCount || 0}+ Students</span>
          </div>
        </div>

        {/* Schedule Info */}
        <div className="text-xs text-slate-500 space-y-1">
          <div>Enrollment ends: {course.enrollment_ends ? new Date(course.enrollment_ends).toLocaleDateString() : 'Not set'}</div>
          <div>Class starts: {course.class_starts ? new Date(course.class_starts).toLocaleDateString() : 'Not set'}</div>
          {course.selected_days && course.selected_days.length > 0 && (
            <div>Days: {course.selected_days.join(', ')}</div>
          )}
        </div>

        {/* Pricing Logic */}
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-white tracking-tight">{course.price} TK</span>
          {discountPercentage > 0 && (
            <>
              <span className="text-sm text-slate-500 line-through decoration-slate-600">{course.old_price}TK</span>
              <span className="bg-red-950/40 text-red-500 text-[10px] font-black px-2 py-0.5 rounded border border-red-900/30">
                {discountPercentage}% OFF
              </span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button className="flex-1 py-3 bg-[#059669] hover:bg-[#047857] text-white font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-900/20">
            View Details
          </button>
          <button 
            onClick={onEdit}
            className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
