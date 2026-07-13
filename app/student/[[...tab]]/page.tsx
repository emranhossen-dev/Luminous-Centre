"use client";

import React, { useState, useEffect } from 'react';

// Import tab content components
import Dashboard from '@/components/student/Dashboard';
import MyCourses from '@/components/student/MyCourses';
import ClassJoining from '@/components/student/ClassJoining';
import Recording from '@/components/student/Recording';
import Resources from '@/components/student/Resources';
import Assignments from '@/components/student/Assignments';
import StudentQuizzesList from '@/components/student/StudentQuizzesList';
import BuildMyCV from '@/components/student/BuildMyCV';
import ProfileComponent from '@/components/ProfileComponent';

interface StudentPageProps {
  params: Promise<{ tab?: string[] }>;
}

export default function StudentPage({ params }: StudentPageProps) {
  const resolvedParams = React.use(params);
  const tabParam = resolvedParams.tab?.[0] || 'dashboard';

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
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 mt-4">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <>
      {tabParam === 'dashboard' && (isEnrolled ? <Dashboard /> : <MyCourses />)}
      {tabParam === 'class-joining' && <ClassJoining />}
      {tabParam === 'my-courses' && <MyCourses />}
      {tabParam === 'recording' && <Recording />}
      {tabParam === 'resources' && <Resources />}
      {tabParam === 'assignments' && <Assignments />}
      {tabParam === 'quiz' && <StudentQuizzesList />}
      {tabParam === 'build-my-cv' && <BuildMyCV />}
      {tabParam === 'profile' && <ProfileComponent />}
    </>
  );
}
