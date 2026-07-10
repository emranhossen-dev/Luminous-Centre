"use client";

import React, { useEffect, useState } from 'react';
import { Users, BookOpen, GraduationCap, Award, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useAdminTheme } from '@/contexts/AdminThemeContext';

// Mock Data for charts
const studentGrowthData = [
  { name: 'Jan', students: 400 },
  { name: 'Feb', students: 600 },
  { name: 'Mar', students: 800 },
  { name: 'Apr', students: 1200 },
  { name: 'May', students: 1500 },
  { name: 'Jun', students: 2000 },
];

const coursePopularityData = [
  { name: 'JS Basics', enrollments: 400 },
  { name: 'React', enrollments: 300 },
  { name: 'Python', enrollments: 200 },
  { name: 'UI/UX', enrollments: 278 },
  { name: 'Node.js', enrollments: 189 },
];

export default function EmployeeDashboard() {
  const { theme } = useAdminTheme();
  const [stats, setStats] = useState({
    mentors: 0,
    students: 0,
    courses: 0,
    quizzes: 0,
    enrollments: 0,
    certificates: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating API call
    const timer = setTimeout(() => {
      setStats({
        mentors: 42,
        students: 1250,
        courses: 85,
        quizzes: 120,
        enrollments: 3400,
        certificates: 890,
        completionRate: 68,
      });
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Employee Dashboard Overview
        </h1>
        <button className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
          isDark 
            ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' 
            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
        }`}>
          Download Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`p-6 rounded-xl border shadow-sm flex items-center gap-4 transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
        }`}>
          <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.students}</div>
            <div className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Total Students
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border shadow-sm flex items-center gap-4 transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
        }`}>
          <div className="w-12 h-12 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.mentors}</div>
            <div className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Total Mentors
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border shadow-sm flex items-center gap-4 transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
        }`}>
          <div className="w-12 h-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.courses}</div>
            <div className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Active Courses
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border shadow-sm flex items-center gap-4 transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
        }`}>
          <div className="w-12 h-12 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.certificates}</div>
            <div className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Certificates Issued
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Growth Chart */}
        <div className={`p-6 rounded-xl border shadow-sm space-y-4 transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Student Growth</h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={studentGrowthData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <Line type="monotone" dataKey="students" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <CartesianGrid stroke={isDark ? '#334155' : '#f3f4f6'} strokeDasharray="5 5" />
                <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#6b7280'} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={isDark ? '#94a3b8' : '#6b7280'} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#1e293b' : '#1f2937', 
                    border: 'none', 
                    borderRadius: '8px', 
                    color: '#fff' 
                  }}
                  itemStyle={{ color: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course Popularity Chart */}
        <div className={`p-6 rounded-xl border shadow-sm space-y-4 transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Course Popularity</h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coursePopularityData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid stroke={isDark ? '#334155' : '#f3f4f6'} strokeDasharray="5 5" vertical={false} />
                <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#6b7280'} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={isDark ? '#94a3b8' : '#6b7280'} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: isDark ? '#334155' : '#f3f4f6' }}
                  contentStyle={{ 
                    backgroundColor: isDark ? '#1e293b' : '#1f2937', 
                    border: 'none', 
                    borderRadius: '8px', 
                    color: '#fff' 
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="enrollments" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
