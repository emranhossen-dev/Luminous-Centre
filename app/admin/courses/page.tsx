"use client";

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CourseCard from '@/components/admin/CourseCard';
import { Course } from '@/types/course';

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (courseId: number, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        // Refresh courses list
        fetchCourses();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update course status');
      }
    } catch (error) {
      console.error('Error updating course status:', error);
      alert('Failed to update course status');
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/admin/courses/edit/${id}`);
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      
      // First check if course has enrollments
      const enrollmentsResponse = await fetch(`/api/admin/courses/${id}/enrollments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (enrollmentsResponse.ok) {
        const enrollmentsData = await enrollmentsResponse.json();
        
        if (enrollmentsData.count > 0) {
          // Course has enrollments, show options
          const action = confirm(
            `This course has ${enrollmentsData.count} enrolled students.\n\n` +
            `Click OK to remove all enrollments and delete the course.\n` +
            `Click CANCEL to keep the course and enrollments.`
          );
          
          if (!action) return;
          
          // Remove enrollments first
          const deleteEnrollmentsResponse = await fetch(`/api/admin/courses/${id}/enrollments`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (!deleteEnrollmentsResponse.ok) {
            const error = await deleteEnrollmentsResponse.json();
            alert('Failed to remove enrollments: ' + (error.error || 'Unknown error'));
            return;
          }
        }
      }
      
      // Now delete the course
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        // Refresh courses list
        fetchCourses();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course');
    }
  };

  
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Course Management</h2>
          <p className="text-gray-500 font-medium">Design and deploy premium learning experiences</p>
        </div>
        <button 
          onClick={() => router.push('/admin/courses/add-course')}
          className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-[20px] font-black hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1"
        >
          <Plus className="w-5 h-5" /> Launch Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-400 font-bold uppercase tracking-widest">Syncing courses...</div>
        ) : (
          courses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              onDelete={() => handleDelete(course.id)} 
              onStatusUpdate={(status) => handleStatusUpdate(course.id, status)}
            />
          ))
        )}
      </div>
    </div>
  );
}
