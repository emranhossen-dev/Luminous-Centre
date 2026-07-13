"use client";

import React, { useState, useEffect } from 'react';
import StudentSidebar from '@/components/student/StudentSidebar';
import StudentTopNav from '@/components/student/StudentTopNav';

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
  const [activeTab, setActiveTab] = useState(tabParam);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync state when tabParam changes from Next.js routing
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Sync state with browser back/forward (popstate)
  useEffect(() => {
    const handleUrlChange = () => {
      const pathname = window.location.pathname;
      const parts = pathname.split('/');
      const tabFromPath = parts[2];
      if (tabFromPath) {
        setActiveTab(tabFromPath);
      } else {
        setActiveTab('dashboard');
      }
    };

    handleUrlChange();

    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

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

  return (
    <div className="min-h-screen bg-[#0a0f18] flex relative overflow-hidden">
      {/* Mobile Drawer Overlay Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <StudentSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-hidden">
        {/* Top Navigation */}
        <StudentTopNav 
          onMenuToggle={() => setSidebarOpen(true)}
        />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
            {activeTab === 'dashboard' && (isEnrolled ? <Dashboard /> : <MyCourses />)}
            {activeTab === 'class-joining' && <ClassJoining />}
            {activeTab === 'my-courses' && <MyCourses />}
            {activeTab === 'recording' && <Recording />}
            {activeTab === 'resources' && <Resources />}
            {activeTab === 'assignments' && <Assignments />}
            {activeTab === 'quiz' && <StudentQuizzesList />}
            {activeTab === 'build-my-cv' && <BuildMyCV />}
            {activeTab === 'profile' && <ProfileComponent />}
          </div>
        </main>
      </div>
    </div>
  );
}
