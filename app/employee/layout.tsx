"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname, notFound } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import Navbar from '@/components/admin/Navbar';
import { AdminThemeProvider, useAdminTheme } from '@/contexts/AdminThemeContext';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLayout } from '@/contexts/LayoutContext';

function EmployeeLayoutContent({ children }: { children: React.ReactNode }) {
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

        .admin-theme-wrapper {
          background-color: var(--admin-bg);
          color: var(--admin-text);
        }

        .admin-theme-wrapper select,
        .admin-theme-wrapper input,
        .admin-theme-wrapper textarea {
          color: var(--admin-text);
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

        .admin-theme-wrapper.dark .bg-gray-50,
        .admin-theme-wrapper.dark .bg-gray-100,
        .admin-theme-wrapper.dark .bg-slate-50,
        .admin-theme-wrapper.dark .bg-slate-100 {
          background-color: #1e293b !important;
          color: var(--admin-text) !important;
        }

        .admin-theme-wrapper.dark .bg-blue-50,
        .admin-theme-wrapper.dark .bg-blue-100,
        .admin-theme-wrapper.dark .bg-indigo-50,
        .admin-theme-wrapper.dark .bg-indigo-100 {
          background-color: rgba(59, 130, 246, 0.1) !important;
        }

        .admin-theme-wrapper.dark .bg-green-50,
        .admin-theme-wrapper.dark .bg-green-100 {
          background-color: rgba(16, 185, 129, 0.1) !important;
        }
        
        .admin-theme-wrapper.dark .bg-red-50,
        .admin-theme-wrapper.dark .bg-red-100 {
          background-color: rgba(239, 68, 68, 0.1) !important;
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

        .admin-theme-wrapper.dark .text-blue-500,
        .admin-theme-wrapper.dark .text-blue-600,
        .admin-theme-wrapper.dark .text-blue-700,
        .admin-theme-wrapper.dark .text-blue-800 {
          color: #60a5fa !important;
        }

        .admin-theme-wrapper.dark .text-green-600,
        .admin-theme-wrapper.dark .text-green-700,
        .admin-theme-wrapper.dark .text-green-800 {
          color: #34d399 !important;
        }

        .admin-theme-wrapper.dark .text-red-600,
        .admin-theme-wrapper.dark .text-red-700 {
          color: #f87171 !important;
        }

        .admin-theme-wrapper.dark .border-gray-100,
        .admin-theme-wrapper.dark .border-gray-200,
        .admin-theme-wrapper.dark .border-gray-300,
        .admin-theme-wrapper.dark .border-slate-200,
        .admin-theme-wrapper.dark .border-slate-300 {
          border-color: var(--admin-border) !important;
        }

        .admin-theme-wrapper.dark .hover\:bg-gray-50:hover,
        .admin-theme-wrapper.dark .hover\:bg-gray-100:hover,
        .admin-theme-wrapper.dark .hover\:bg-slate-50:hover {
          background-color: #334155 !important;
        }

        .admin-theme-wrapper.dark select,
        .admin-theme-wrapper.dark input,
        .admin-theme-wrapper.dark textarea {
          background-color: #0f172a !important;
          color: #f8fafc !important;
          border-color: #334155 !important;
        }
        
        .admin-theme-wrapper.dark input::placeholder,
        .admin-theme-wrapper.dark textarea::placeholder {
          color: #64748b !important;
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

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const { hideNavbarAndFooter } = useLayout();

  useEffect(() => {
    if (hideNavbarAndFooter) {
      return;
    }

    const authenticated = isAdminAuthenticated();
    if (!authenticated) {
      notFound();
      return;
    }

    // Check role is admin or employee
    const userStr = localStorage.getItem('adminUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.roleName !== 'employee' && user.roleName !== 'admin') {
          notFound();
          return;
        }
      } catch (e) {
        notFound();
        return;
      }
    }

    setIsAuth(true);
  }, [router, pathname, hideNavbarAndFooter]);

  if (hideNavbarAndFooter) {
    return <AdminThemeProvider>{children}</AdminThemeProvider>;
  }

  if (isAuth === null) {
    return (
      <div className="min-h-screen bg-[#0b0c17] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AdminThemeProvider>
      <EmployeeLayoutContent>{children}</EmployeeLayoutContent>
    </AdminThemeProvider>
  );
}
