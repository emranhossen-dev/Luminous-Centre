"use client";

import React from 'react';
import StudentSidebar from './StudentSidebar';
import StudentTopNav from './StudentTopNav';

interface StudentLayoutProps {
  children: React.ReactNode;
  showNotifications?: boolean;
  notificationsCount?: number;
}

export default function StudentLayout({ 
  children, 
  showNotifications = false,
  notificationsCount = 0 
}: StudentLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0a0f18] flex">
      {/* Sidebar */}
      <StudentSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <StudentTopNav 
          notifications={notificationsCount}
        />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
