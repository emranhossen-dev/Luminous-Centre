"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Bell, 
  Moon, 
  Sun, 
  Monitor, 
  User, 
  LogOut, 
  ChevronDown,
  Command,
  Plus,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminTheme } from '@/contexts/AdminThemeContext';

export default function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New student enrolled in MERN Stack', time: '2 mins ago', unread: true },
    { id: 2, text: 'Admin login detected from new IP', time: '1 hour ago', unread: true },
    { id: 3, text: 'Course "Python for Beginners" published', time: '5 hours ago', unread: false },
  ]);

  const { theme, setTheme } = useAdminTheme();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/admin/login');
  };

  const getThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return {
          navbar: 'bg-slate-900/95 backdrop-blur-md border-b border-slate-800',
          search: {
            container: 'bg-slate-800',
            input: 'bg-slate-800 text-slate-100 placeholder-slate-400 focus:bg-slate-700 focus:ring-blue-500/30',
            icon: 'text-slate-400 group-focus-within:text-blue-400',
            shortcut: 'bg-slate-700 border-slate-600 text-slate-400'
          },
          button: 'hover:bg-slate-800 text-slate-300',
          dropdown: 'bg-slate-800 border-slate-700 shadow-2xl shadow-black/50',
          dropdownItem: 'hover:bg-slate-700 text-slate-200',
          dropdownBorder: 'border-slate-700',
          text: {
            primary: 'text-slate-100',
            secondary: 'text-slate-400',
            muted: 'text-slate-500'
          },
          profile: {
            container: 'bg-slate-800 border-slate-700 hover:border-blue-500/50 hover:bg-blue-500/10',
            name: 'text-slate-100',
            role: 'text-slate-400'
          }
        };
      case 'blue':
        return {
          navbar: 'bg-blue-50/95 backdrop-blur-md border-b border-blue-200',
          search: {
            container: 'bg-white',
            input: 'bg-white text-blue-900 placeholder-blue-400 focus:bg-blue-50 focus:ring-blue-500/30',
            icon: 'text-blue-400 group-focus-within:text-blue-600',
            shortcut: 'bg-blue-100 border-blue-200 text-blue-600'
          },
          button: 'hover:bg-blue-100 text-blue-600',
          dropdown: 'bg-white border-blue-200 shadow-xl shadow-blue-500/10',
          dropdownItem: 'hover:bg-blue-50 text-blue-900',
          dropdownBorder: 'border-blue-100',
          text: {
            primary: 'text-blue-900',
            secondary: 'text-blue-600',
            muted: 'text-blue-400'
          },
          profile: {
            container: 'bg-white border-blue-200 hover:border-blue-500/50 hover:bg-blue-50/50',
            name: 'text-blue-900',
            role: 'text-blue-600'
          }
        };
      default: // light
        return {
          navbar: 'bg-white/95 backdrop-blur-md border-b border-gray-200',
          search: {
            container: 'bg-gray-100',
            input: 'bg-gray-100 text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-blue-500/20',
            icon: 'text-gray-400 group-focus-within:text-blue-500',
            shortcut: 'bg-white border-gray-200 text-gray-400'
          },
          button: 'hover:bg-gray-100 text-gray-600',
          dropdown: 'bg-white border-gray-100 shadow-2xl',
          dropdownItem: 'hover:bg-gray-50 text-gray-700',
          dropdownBorder: 'border-gray-100',
          text: {
            primary: 'text-gray-900',
            secondary: 'text-gray-600',
            muted: 'text-gray-400'
          },
          profile: {
            container: 'bg-white border-gray-200 hover:border-blue-500/50 hover:bg-blue-50/10',
            name: 'text-gray-900',
            role: 'text-gray-500'
          }
        };
    }
  };

  const themeClasses = getThemeClasses();

  return (
    <header className={`h-20 ${themeClasses.navbar} px-8 flex items-center justify-between sticky top-0 z-40 transition-all duration-300`}>
      {/* Left: Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className={`h-5 w-5 ${themeClasses.search.icon} transition-colors`} />
          </div>
          <input
            type="text"
            className={`block w-full pl-11 pr-24 py-2.5 ${themeClasses.search.input} border-none rounded-2xl text-sm focus:outline-none transition-all`}
            placeholder="Search menus, students, courses..."
          />
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <div className={`flex items-center gap-1 ${themeClasses.search.shortcut} px-2 py-0.5 rounded-lg text-[10px] font-bold`}>
              <Command className="w-3 h-3" /> K
            </div>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Theme Switcher */}
        <div className="relative">
          <button 
            onClick={() => setIsThemeOpen(!isThemeOpen)}
            className={`p-2.5 rounded-xl ${themeClasses.button} transition-colors`}
          >
            {theme === 'light' ? <Sun className="w-5 h-5" /> : theme === 'dark' ? <Moon className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
          </button>
          
          <AnimatePresence>
            {isThemeOpen && (
              <>
                <div className="fixed inset-0" onClick={() => setIsThemeOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className={`absolute right-0 mt-3 w-44 ${themeClasses.dropdown} rounded-2xl p-2 overflow-hidden transition-all duration-300`}
                >
                  <button 
                    onClick={() => {setTheme('light'); setIsThemeOpen(false)}} 
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl ${themeClasses.dropdownItem} text-sm transition-colors`}
                  >
                    <Sun className="w-4 h-4 text-orange-500" /> Light Mode
                  </button>
                  <button 
                    onClick={() => {setTheme('dark'); setIsThemeOpen(false)}} 
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl ${themeClasses.dropdownItem} text-sm transition-colors`}
                  >
                    <Moon className="w-4 h-4 text-indigo-500" /> Dark Mode
                  </button>
                  <button 
                    onClick={() => {setTheme('blue'); setIsThemeOpen(false)}} 
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl ${themeClasses.dropdownItem} text-sm transition-colors`}
                  >
                    <div className="w-4 h-4 rounded-full bg-blue-600" /> Premium Blue
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setIsNotifyOpen(!isNotifyOpen)}
            className={`p-2.5 rounded-xl ${themeClasses.button} transition-colors relative`}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
          </button>

          <AnimatePresence>
            {isNotifyOpen && (
              <>
                <div className="fixed inset-0" onClick={() => setIsNotifyOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className={`absolute right-0 mt-3 w-80 ${themeClasses.dropdown} rounded-2xl overflow-hidden transition-all duration-300`}
                >
                  <div className={`p-4 ${themeClasses.dropdownBorder} flex items-center justify-between`}>
                    <h3 className={`font-bold ${themeClasses.text.primary}`}>Notifications</h3>
                    <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-full">3 New</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className={`p-4 ${themeClasses.dropdownItem} transition-colors ${themeClasses.dropdownBorder} last:border-0 cursor-pointer`}>
                        <p className={`text-sm ${themeClasses.text.primary} leading-snug mb-1`}>{n.text}</p>
                        <p className={`text-[10px] ${themeClasses.text.muted} font-medium`}>{n.time}</p>
                      </div>
                    ))}
                  </div>
                  <button className={`w-full py-3 text-xs font-bold text-blue-600 ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-50'} transition-colors`}>
                    View all notifications
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative ml-2">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`flex items-center gap-3 pl-1 pr-3 py-1 ${themeClasses.profile.container} rounded-2xl transition-all group`}
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-600/20">
              A
            </div>
            <div className="text-left hidden md:block">
              <p className={`text-xs font-bold ${themeClasses.profile.name} leading-none mb-1`}>Admin User</p>
              <p className={`text-[10px] ${themeClasses.profile.role} font-medium`}>Super Admin</p>
            </div>
            <ChevronDown className={`w-4 h-4 ${themeClasses.text.secondary} transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <>
                <div className="fixed inset-0" onClick={() => setIsProfileOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className={`absolute right-0 mt-3 w-56 ${themeClasses.dropdown} rounded-2xl p-2 overflow-hidden transition-all duration-300`}
                >
                  <div className={`px-3 py-2 mb-2 ${themeClasses.dropdownBorder} pb-3`}>
                    <p className={`text-sm font-bold ${themeClasses.text.primary}`}>Admin User</p>
                    <p className={`text-xs ${themeClasses.text.muted}`}>admin@luminous.com</p>
                  </div>
                  <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl ${themeClasses.dropdownItem} text-sm transition-colors`}>
                    <User className={`w-4 h-4 ${themeClasses.text.secondary}`} /> My Profile
                  </button>
                  <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl ${themeClasses.dropdownItem} text-sm transition-colors`}>
                    <Settings className={`w-4 h-4 ${themeClasses.text.secondary}`} /> Security Settings
                  </button>
                  <div className={`h-px ${themeClasses.dropdownBorder} my-2`} />
                  <button 
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl ${theme === 'dark' ? 'hover:bg-red-900/20' : 'hover:bg-red-50'} text-sm text-red-600 font-medium transition-colors`}
                  >
                    <LogOut className="w-4 h-4" /> Logout Account
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
