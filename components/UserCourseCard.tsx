"use client";

import React from 'react';
import Link from 'next/link';
import { Clock, Users, Star } from 'lucide-react';

interface UserCourseCardProps {
  course: {
    id: number;
    title: string;
    slug: string;
    thumbnail_url?: string;
    category: string;
    price: number;
    old_price?: number;
    status: string;
    level: string;
    duration_weeks?: number;
    total_hours?: number;
    enrollmentCount?: number;
    featured?: boolean;
    batch?: string;
    created_at?: string;
    enrollment_ends?: string;
    class_starts?: string;
    description?: string;
    short_description?: string;
    language?: string;
    access_type?: string;
    course_outline_url?: string;
  };
}

export default function UserCourseCard({ course }: UserCourseCardProps) {
  // Calculate discount percentage
  const discountPercentage = course.old_price && course.old_price > course.price 
    ? Math.round(((course.old_price - course.price) / course.old_price) * 100)
    : 0;

  // Format price with TK
  const formatPrice = (price: number) => `${price.toLocaleString()} TK`;

  // Get category color
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'online': '#a100c1',
      'offline': '#00a651',
      'recorded': '#f59e0b',
      'hybrid': '#3b82f6'
    };
    return colors[category.toLowerCase()] || '#6b7280';
  };

  // Calculate days left until enrollment ends
  const calculateDaysLeft = () => {
    if (!course.enrollment_ends) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate calculation
    
    const enrollmentEndDate = new Date(course.enrollment_ends);
    enrollmentEndDate.setHours(0, 0, 0, 0); // Set to start of day for accurate calculation
    
    const differenceInTime = enrollmentEndDate.getTime() - today.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    
    return differenceInDays >= 0 ? differenceInDays : 0;
  };

  const daysLeft = calculateDaysLeft();

  return (
    <div 
      className="w-full bg-[#121821] rounded-[16px] overflow-hidden border border-[#1e293b] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.4)] cursor-pointer hover:border-[#00a651]/50 transition-all hover:transform hover:scale-[1.02] hover:-translate-y-1"
      onClick={() => window.location.href = `/courses/${course.slug}`}
    >
      
      {/* Course Image with Category Badge */}
      <div className="relative h-[200px] overflow-hidden">
        <div 
          className="absolute top-[15px] left-[15px] bg-[#a100c1] text-white py-1 px-[14px] rounded-[8px] font-bold text-[13px] z-10"
        >
          {course.category ? course.category.charAt(0).toUpperCase() + course.category.slice(1) : 'Online'}
        </div>
        {course.thumbnail_url && course.thumbnail_url !== '' ? (
          <img 
            src={course.thumbnail_url} 
            alt={course.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://i.ibb.co/35332p83/preview.png';
            }}
          />
        ) : (
          <img 
            src="https://i.ibb.co/35332p83/preview.png" 
            alt="Default course image"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Batch Badge and Time Remaining */}
      <div className="flex items-center pt-[15px] pb-[5px] pr-[15px] gap-[10px]">
        {course.batch && (
          <div className="relative bg-[#00a651] text-white py-[4px] pl-[12px] pr-[12px] font-bold text-[12px] rounded-r-[2px]">
            {course.batch}
            <div className="absolute top-0 -right-[10px] w-0 h-0 border-t-[13px] border-t-transparent border-b-[13px] border-b-transparent border-l-[10px] border-l-[#00a651]"></div>
          </div>
        )}

        {/* Always show days left for testing */}
        <div className="ml-auto flex items-center gap-[5px] bg-red-500 text-white py-[5px] px-[10px] rounded-[6px] text-[11px] font-bold border border-red-600">
          <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          {daysLeft !== null ? (daysLeft === 0 ? 'আজই শেষ' : `${daysLeft} দিন বাকি`) : 'No Data'}
        </div>
      </div>

      {/* Course Title */}
      <h2 className="text-white text-[18px] font-bold mx-[15px] my-[12px] leading-[1.4] text-justify">
        {course.title}
      </h2>

      {/* Enrollment Ends - New Section */}
      {course.enrollment_ends && (
        <div className="px-[15px] mb-[8px]">
          <div className="flex justify-between items-center text-[12px] text-[#94a3b8]">
            <span className="text-[#00a651] font-bold uppercase tracking-wider">Enrollment Ends:</span>
            <span>
              {(() => {
                try {
                  return new Date(course.enrollment_ends).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  });
                } catch (error) {
                  return 'Date not available';
                }
              })()}
            </span>
          </div>
        </div>
      )}

      {/* Class Start Date Section - Only show when data exists */}
      {course.class_starts && (
        <div className="flex justify-between items-center px-[15px] mb-[12px] text-[12px] text-[#94a3b8]">
          <span className="text-[#00a651] font-bold uppercase tracking-wider mr-1">Class Starts:</span> 
          {new Date(course.class_starts).toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </div>
      )}

      {/* Pricing Section */}
      <div className="flex justify-between items-center px-[15px] pb-[15px]">
        <div className="flex items-baseline gap-[8px]">
          <span className="text-white text-[24px] font-extrabold">{formatPrice(course.price)}</span>
          {course.old_price && course.old_price > course.price && (
            <span className="text-[#64748b] line-through text-[14px]">{formatPrice(course.old_price)}</span>
          )}
        </div>
        {discountPercentage > 0 && (
          <div className="bg-[#991b1b] text-white text-[11px] font-bold px-[8px] py-[4px] rounded-[4px]">
            {discountPercentage}% Off
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="px-[15px] pb-[15px]">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = `/courses/${course.slug}`;
          }}
          className="w-full bg-[#00a651] text-white py-[12px] rounded-[10px] font-bold text-[15px] hover:opacity-90 transition-opacity duration-200"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
