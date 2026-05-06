"use client";

import React from 'react';
import { Edit, Trash2, Eye, Users, Calendar, DollarSign, Clock, MoreVertical } from 'lucide-react';

interface AdminCourseCardProps {
  course: {
    id: number;
    title: string;
    slug: string;
    description: string;
    category: string;
    price: number;
    old_price?: number;
    status: string;
    featured: boolean;
    createdAt: string;
    enrollmentCount: number;
    createdBy: string;
    thumbnail_url?: string;
    batch?: string;
    access_type?: string;
    class_time?: string;
    course_details?: any;
  };
  onEdit: () => void;
  onDelete: () => void;
  onStatusUpdate: (id: number, status: string) => void;
}

export default function AdminCourseCard({ course, onEdit, onDelete, onStatusUpdate }: AdminCourseCardProps) {
  // Calculate discount percentage
  const discountPercentage = course.old_price && course.old_price > course.price 
    ? Math.round(((course.old_price - course.price) / course.old_price) * 100)
    : 0;

  // Format price
  const formatPrice = (price: number) => `৳${price.toLocaleString()}`;

  // Get status color
  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'draft': 'bg-gray-100 text-gray-700 border-gray-300',
      'published': 'bg-green-100 text-green-700 border-green-300',
      'archived': 'bg-red-100 text-red-700 border-red-300'
    };
    return colors[status.toLowerCase()] || colors['draft'];
  };

  // Get category badge color
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'online': 'bg-blue-100 text-blue-700 border-blue-300',
      'offline': 'bg-green-100 text-green-700 border-green-300',
      'recorded': 'bg-orange-100 text-orange-700 border-orange-300',
      'project': 'bg-purple-100 text-purple-700 border-purple-300'
    };
    return colors[category.toLowerCase()] || colors['online'];
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Header with Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
        {course.thumbnail_url ? (
          <img 
            src={course.thumbnail_url} 
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                <Eye className="w-8 h-8 text-gray-500" />
              </div>
              <span className="text-sm">No Image</span>
            </div>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(course.status)}`}>
            {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
          </span>
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(course.category)}`}>
            {course.category.charAt(0).toUpperCase() + course.category.slice(1)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
          {course.title}
        </h3>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{course.enrollmentCount || 0}</span>
          </div>
          {course.batch && (
            <div className="flex items-center gap-1">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                Batch {course.batch}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(course.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {course.description || 'No description available'}
        </p>

        {/* Pricing */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">{formatPrice(course.price)}</span>
            {course.old_price && course.old_price > course.price && (
              <>
                <span className="text-sm text-gray-500 line-through">{formatPrice(course.old_price)}</span>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                  -{discountPercentage}%
                </span>
              </>
            )}
          </div>
          {course.featured && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
              ⭐ Featured
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {course.status === 'draft' && (
            <button 
              onClick={() => onStatusUpdate(course.id, 'published')}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Publish
            </button>
          )}
          {course.status === 'published' && (
            <button 
              onClick={() => onStatusUpdate(course.id, 'draft')}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
            >
              Unpublish
            </button>
          )}
          <button 
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button 
            onClick={onDelete}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
