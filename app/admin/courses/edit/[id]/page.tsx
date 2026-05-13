"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import CourseLaunchForm from '@/components/admin/CourseLaunchForm';

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourse();
  }, [params.id]);

  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/courses/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCourseData(data.course);
      } else {
        setError('Failed to fetch course');
      }
    } catch (error) {
      console.error('Failed to fetch course:', error);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    router.push('/admin/courses');
  };

  const handleSuccess = () => {
    router.push('/admin/courses');
  };

  if (loading) {
    return (
      <div className="p-8 bg-slate-950 min-h-screen flex items-center justify-center">
        <div className="text-white">Loading course...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-slate-950 min-h-screen flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-950 min-h-screen">
      <CourseLaunchForm 
        onClose={handleClose} 
        onSuccess={handleSuccess}
        initialData={courseData}
        isEditMode={true}
      />
    </div>
  );
}
