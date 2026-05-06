"use client";

import React, { useState, useEffect } from 'react';
import Dashboard from '@/components/student/Dashboard';
import MyCourses from '@/components/student/MyCourses';

export default function StudentPage() {
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkEnrollmentStatus();
  }, []);

  const checkEnrollmentStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/student/enrollments', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const enrollments = data.enrollments || [];
        setIsEnrolled(enrollments.length > 0);
      }
    } catch (error) {
      console.error('Failed to check enrollment status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0f18]">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 mt-4">Loading your dashboard...</p>
      </div>
    );
  }

  // Show Dashboard for enrolled students, MyCourses for unenrolled students
  return isEnrolled ? <Dashboard /> : <MyCourses />;
}