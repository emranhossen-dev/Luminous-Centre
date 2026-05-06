"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import CourseLaunchForm from '@/components/admin/CourseLaunchForm';

export default function AddCoursePage() {
  const router = useRouter();

  const handleClose = () => {
    router.push('/admin/courses');
  };

  const handleSuccess = () => {
    router.push('/admin/courses');
  };

  return (
    <div className="p-8 bg-slate-950 min-h-screen">
      <CourseLaunchForm 
        onClose={handleClose} 
        onSuccess={handleSuccess} 
      />
    </div>
  );
}
