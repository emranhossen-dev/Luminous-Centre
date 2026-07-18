"use client";

import React, { useState } from 'react';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-[#0a0f18] flex relative overflow-hidden">
      {/* Mobile Drawer Overlay Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <StudentSidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navigation */}
        <StudentTopNav 
          notifications={notificationsCount}
          onMenuToggle={() => setSidebarOpen(true)}
        />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
