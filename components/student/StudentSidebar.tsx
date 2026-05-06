"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Video, 
  BookOpen, 
  PlayCircle, 
  FolderOpen, 
  FileText,
  ChevronRight
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/student' },
  { id: 'class-joining', label: 'Class Joining', icon: Video, href: '/student/class-joining' },
  { id: 'my-courses', label: 'My Courses', icon: BookOpen, href: '/student/my-courses' },
  { id: 'recording', label: 'Recording', icon: PlayCircle, href: '/student/recording' },
  { id: 'resources', label: 'Resources', icon: FolderOpen, href: '/student/resources' },
  { id: 'build-my-cv', label: 'Build My CV', icon: FileText, href: '/student/build-my-cv' },
];

export default function StudentSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-72 h-screen bg-slate-900 text-slate-300 flex flex-col border-r border-white/5 relative z-50">
      {/* Institute Header */}
      <div className="h-20 flex items-center px-6 border-b border-white/5 mb-4">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="p-2 bg-emerald-600 rounded-xl group-hover:rotate-12 transition-transform duration-300">
            <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center">
              <span className="text-emerald-600 font-bold text-xs">LC</span>
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-none mb-1">Luminous Centre</h1>
            <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-semibold">Skill Development</p>
          </div>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar pb-6">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (pathname === '/student' && item.id === 'dashboard');
          const Icon = item.icon;

          return (
            <Link key={item.id} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-600/20' 
                    : 'hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-500' : 'text-slate-400 group-hover:text-white'}`} />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                {isActive && (
                  <motion.div layoutId="active-indicator">
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
