"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight, Shield } from 'lucide-react';
import { menuItems } from '@/lib/admin-menu';

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('adminUser');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Failed to parse admin user from localStorage:', e);
      }
    }
  }, []);

  const hasAccess = (itemId: string) => {
    if (!user) return false;
    // Admins always have access
    if (user.roleName === 'admin') return true;
    // Wildcard permissions
    if (user.permissions?.includes('*')) return true;
    // Dashboard and profile are default access for all logged in staff
    if (itemId === 'dashboard' || itemId === 'profile') return true;
    
    // Check specific module permission
    return user.permissions?.includes(itemId);
  };

  return (
    <div className="w-72 h-screen bg-slate-900 text-slate-300 flex flex-col border-r border-white/5 relative z-50">
      {/* Sidebar Header */}
      <div className="h-20 flex items-center px-6 border-b border-white/5 mb-4">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="p-2 bg-blue-600 rounded-xl group-hover:rotate-12 transition-transform duration-300">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-none mb-1">Luminous</h1>
            <p className="text-[10px] text-blue-400 uppercase tracking-widest font-semibold">Skill Development</p>
          </div>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar pb-6">
        {menuItems.filter(item => hasAccess(item.id)).map((item) => {
          let href = item.href;
          if (item.id === 'dashboard' && user) {
            if (user.roleName === 'employee') {
              href = '/employee';
            } else if (user.roleName === 'mentor') {
              href = '/mentor';
            } else if (user.roleName === 'admin') {
              href = '/admin/dashboard';
            }
          }
          const isActive = pathname === href;
          const Icon = item.icon;

          return (
            <Link key={item.id} href={href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' 
                    : 'hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-500' : 'text-slate-400 group-hover:text-white'}`} />
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

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-white/5">
        <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">Admin Account</p>
            <p className="text-xs text-slate-500 truncate">Super Admin</p>
          </div>
        </div>
      </div>

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
