"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if admin is authenticated
    if (isAdminAuthenticated()) {
      // Redirect to dashboard if authenticated
      router.push('/admin/dashboard');
    } else {
      // Redirect to login if not authenticated
      router.push('/admin/login');
    }
  }, [router]);

  // Show loading state while checking authentication
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading admin panel...</p>
      </div>
    </div>
  );
}
