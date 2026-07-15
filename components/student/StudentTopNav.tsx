"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, Settings, Menu } from 'lucide-react';
import Link from 'next/link';

interface StudentTopNavProps {
  studentName?: string;
  studentProfile?: string;
  notifications?: number;
  onMenuToggle?: () => void;
}

export default function StudentTopNav({ 
  studentName = "Student Name", 
  studentProfile = "",
  notifications = 0,
  onMenuToggle
}: StudentTopNavProps) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
        setNotificationsList(data.notifications || []);
      }
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const displayName = user ? `${user.firstName} ${user.lastName}` : studentName;
  const profileImage = user?.profileImage || studentProfile;

  return (
    <div className="h-16 bg-slate-900 border-b border-white/5 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 overflow-hidden">
      {/* Left side - Hamburger + Logo for mobile */}
      <div className="flex items-center gap-3 shrink-0">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 -ml-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        {/* Luminous logo visible only on mobile (when sidebar is hidden) */}
        <div className="lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-emerald-500/20 shrink-0">
            <img src="/logo.jpg" alt="Luminous" className="w-full h-full object-cover" />
          </div>
          <span className="text-sm font-bold text-white tracking-tight hidden xs:block">Luminous</span>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side - Profile and Notifications */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-white/5 transition-colors group"
          >
            <Bell className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('token');
                        await fetch('/api/notifications', {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                          body: JSON.stringify({ markAllRead: true })
                        });
                        fetchNotifications();
                      } catch {}
                    }}
                    className="text-[10px] font-bold text-emerald-400 hover:underline cursor-pointer"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                {notificationsList.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-sm">
                    No new notifications
                  </div>
                ) : (
                  notificationsList.map((notif: any) => (
                    <div 
                      key={notif.id}
                      onClick={async () => {
                        if (notif.readStatus) return;
                        try {
                          const token = localStorage.getItem('token');
                          await fetch('/api/notifications', {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                            body: JSON.stringify({ notificationId: notif.id })
                          });
                          fetchNotifications();
                        } catch {}
                      }}
                      className={`p-3 text-left transition-colors cursor-pointer ${
                        notif.readStatus 
                          ? 'hover:bg-white/5 bg-slate-800 text-slate-400' 
                          : 'bg-emerald-500/5 hover:bg-emerald-500/10 font-bold text-white'
                      }`}
                    >
                      <p className="text-xs">{notif.title}</p>
                      <p className="text-[10px] font-medium text-slate-400 mt-0.5 leading-snug">{notif.message}</p>
                      <p className="text-[9px] text-slate-500 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                    </div>
                  ))
                )}
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
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
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
