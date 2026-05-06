"use client";

import React, { useState, useEffect } from 'react';
import { Bell, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';

interface StudentTopNavProps {
  studentName?: string;
  studentProfile?: string;
  notifications?: number;
}

export default function StudentTopNav({ 
  studentName = "Student Name", 
  studentProfile = "",
  notifications = 0 
}: StudentTopNavProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
  };

  const displayName = user ? `${user.firstName} ${user.lastName}` : studentName;
  const profileImage = user?.profileImage || studentProfile;

  return (
    <div className="h-16 bg-slate-900 border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left side - empty for balance */}
      <div className="flex-1"></div>

      {/* Right side - Profile and Notifications */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-white/5 transition-colors group"
          >
            <Bell className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {notifications > 99 ? '99+' : notifications}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-white/10 rounded-xl shadow-xl z-50">
              <div className="p-4 border-b border-white/5">
                <h3 className="text-sm font-semibold text-white">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <div className="p-4 text-center text-slate-500 text-sm">
                  No new notifications
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Student Name */}
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-white">{displayName}</p>
          <p className="text-xs text-slate-500">Student</p>
        </div>

        {/* Profile Image */}
        <div className="relative group">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
            {profileImage ? (
              <img 
                src={profileImage} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-white/10 rounded-xl shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            <div className="p-4 border-b border-white/5">
              <p className="text-sm font-semibold text-white">{displayName}</p>
              <p className="text-xs text-slate-500">{user?.email || 'student@example.com'}</p>
            </div>
            <div className="py-2">
              <Link 
                href="/student/profile"
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4" />
                Profile Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
