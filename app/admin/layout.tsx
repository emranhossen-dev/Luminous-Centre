"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import Navbar from '@/components/admin/Navbar';
import { AdminThemeProvider, useAdminTheme } from '@/contexts/AdminThemeContext';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { theme } = useAdminTheme();

  return (
    <div className={`flex h-screen overflow-hidden admin-theme-wrapper ${theme}`}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <Navbar />

        {/* Dynamic Content */}
        <main className={`flex-1 overflow-y-auto custom-scrollbar-main p-8 transition-colors duration-300 ${
          theme === 'dark' ? 'bg-slate-950' : theme === 'blue' ? 'bg-blue-50' : 'bg-slate-50'
        }`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme === 'dark' ? 'dark' : 'light'}
        style={{
          top: '80px',
        }}
      />

      <style jsx global>{`
        .custom-scrollbar-main::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar-main::-webkit-scrollbar-track {
          background: ${theme === 'dark' ? '#1e293b' : theme === 'blue' ? '#dbeafe' : '#f1f5f9'};
        }
        .custom-scrollbar-main::-webkit-scrollbar-thumb {
          background: ${theme === 'dark' ? '#475569' : theme === 'blue' ? '#93c5fd' : '#cbd5e1'};
          border-radius: 10px;
        }
        .custom-scrollbar-main::-webkit-scrollbar-thumb:hover {
          background: ${theme === 'dark' ? '#64748b' : theme === 'blue' ? '#60a5fa' : '#94a3b8'};
        }
        
        /* Enhanced Theme Variables */
        :root {
          --admin-primary: #2563eb;
          --admin-bg: #f8fafc;
          --admin-card: #ffffff;
          --admin-text: #0f172a;
          --admin-border: #e2e8f0;
          --admin-muted: #64748b;
        }

        .admin-theme-wrapper.dark {
          --admin-bg: #0f172a;
          --admin-card: #1e293b;
          --admin-text: #f8fafc;
          --admin-border: #334155;
          --admin-muted: #94a3b8;
          background-color: var(--admin-bg);
          color: var(--admin-text);
        }

        .admin-theme-wrapper.blue {
          --admin-bg: #eff6ff;
          --admin-primary: #1e40af;
          --admin-card: #ffffff;
          --admin-text: #1e3a8a;
          --admin-border: #dbeafe;
          --admin-muted: #64748b;
          background-color: var(--admin-bg);
          color: var(--admin-text);
        }

        /* Enhanced Toastify Custom Styles */
        .Toastify__toast {
          background: ${theme === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)'} !important;
          backdrop-filter: blur(12px) !important;
          border: 1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} !important;
          border-radius: 12px !important;
          color: ${theme === 'dark' ? '#f8fafc' : '#1f2937'} !important;
          font-family: inherit !important;
          box-shadow: ${theme === 'dark' ? '0 10px 25px rgba(0, 0, 0, 0.5)' : '0 10px 25px rgba(0, 0, 0, 0.1)'} !important;
        }
        .Toastify__toast--success {
          border-color: ${theme === 'dark' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(34, 197, 94, 0.5)'} !important;
        }
        .Toastify__toast--error {
          border-color: ${theme === 'dark' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(239, 68, 68, 0.5)'} !important;
        }
        .Toastify__progress-bar {
          background: linear-gradient(to right, #10b981, #059669) !important;
        }
        .Toastify__close-button {
          color: ${theme === 'dark' ? '#94a3b8' : '#6b7280'} !important;
        }
        .Toastify__close-button:hover {
          color: ${theme === 'dark' ? '#e2e8f0' : '#374151'} !important;
        }
        
        /* Global theme overrides for better readability */
        .admin-theme-wrapper.dark .bg-white {
          background-color: var(--admin-card) !important;
          color: var(--admin-text);
        }

        .admin-theme-wrapper.dark .text-gray-900 {
          color: var(--admin-text) !important;
        }

        .admin-theme-wrapper.dark .text-gray-800 {
          color: #e2e8f0 !important;
        }

        .admin-theme-wrapper.dark .text-gray-700 {
          color: #cbd5e1 !important;
        }

        .admin-theme-wrapper.dark .text-gray-600,
        .admin-theme-wrapper.dark .text-gray-500,
        .admin-theme-wrapper.dark .text-gray-400 {
          color: var(--admin-muted) !important;
        }

        .admin-theme-wrapper.dark .border-gray-100,
        .admin-theme-wrapper.dark .border-gray-200 {
          border-color: var(--admin-border) !important;
        }

        .admin-theme-wrapper.dark .hover\\:bg-gray-50:hover {
          background-color: #334155 !important;
        }

        .admin-theme-wrapper.dark .hover\\:bg-gray-100:hover {
          background-color: #334155 !important;
        }

        /* Blue theme specific overrides */
        .admin-theme-wrapper.blue .bg-white {
          background-color: var(--admin-card) !important;
          color: var(--admin-text);
        }

        .admin-theme-wrapper.blue .text-gray-900 {
          color: var(--admin-text) !important;
        }

        .admin-theme-wrapper.blue .text-gray-600,
        .admin-theme-wrapper.blue .text-gray-500 {
          color: var(--admin-muted) !important;
        }

        .admin-theme-wrapper.blue .border-gray-100,
        .admin-theme-wrapper.blue .border-gray-200 {
          border-color: var(--admin-border) !important;
        }

        .admin-theme-wrapper.blue .hover\\:bg-gray-50:hover {
          background-color: #f0f9ff !important;
        }
      `}</style>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === '/admin/login') {
      setIsAuth(true);
      return;
    }

    const authenticated = isAdminAuthenticated();
    if (!authenticated) {
      router.push('/admin/login');
    } else {
      setIsAuth(true);
    }
  }, [router, pathname]);

  if (isAuth === null) {
    return (
      <div className={`min-h-screen ${pathname === '/admin/login' ? 'bg-slate-950' : 'bg-white'} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Login page doesn't get the full layout
  if (pathname === '/admin/login') {
    return <AdminThemeProvider>{children}</AdminThemeProvider>;
  }

  return (
    <AdminThemeProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminThemeProvider>
  );
}
