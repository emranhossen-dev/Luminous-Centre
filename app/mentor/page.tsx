"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Course {
  id: number;
  title: string;
  slug: string;
  category: string;
  status: string;
  enrolledStudents: number;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  enrolledCourses: number;
  progress: number;
}

export default function MentorDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalAssignments: 0
  });

  useEffect(() => {
    fetchMentorData();
  }, []);

  const fetchMentorData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch courses mentor is teaching
      const coursesResponse = await fetch('/api/courses?mentor=true', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setCourses(coursesData.courses);
      }

      // Fetch students enrolled in mentor's courses
      const studentsResponse = await fetch('/api/mentor/students', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        setStudents(studentsData.students);
      }

      // Fetch mentor stats
      const statsResponse = await fetch('/api/mentor/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Failed to fetch mentor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'recorded': return 'bg-blue-100 text-blue-800';
      case 'online': return 'bg-purple-100 text-purple-800';
      case 'offline': return 'bg-green-100 text-green-800';
      case 'govt': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Mentor Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="text-gray-500 hover:text-gray-700">
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-500 rounded-full">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.35a4 4 0 00-4 4 0 4 4 0 0 6.627 5.373 12 12 5.373 0 0 6.627-5.373S12 12 5.373 6.253 0 0 6.627 5.373 12 12 5.373zm0 5.373C6.627 2.403 12 7.597 2.403 0 0-5.373-5.373S12 7.597 6.253 2.403zm0 7.597c0-3.9 3.9 0 0 3.9 3.9 0 0 3.9 3.9zm0 3.9v-3.9h-1.5c0-1.33.576-3-3.9-3.9V8.1c0 2.924 1.5 3.9 3.9 1.5 0 0 2.924-1.5 3.9-3.9zm0 8.1c0 3.078 1.5 3.9 3.9 1.5 0 0 3.078-1.5 3.9-3.9zm0 10.5c0 2.486 1.5 3.9 3.9 1.5 0 0 2.486-1.5 3.9-3.9zm0 12.9c0 2.895 1.5 3.9 3.9 1.5 0 0 2.895-1.5 3.9-3.9z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Total Students</h3>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalStudents}</p>
                  </div>
                </div>
              </div>
            </div>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-500 rounded-full">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002 2v6a2 2 0 00-2 2H9a2 2 0 00-2-2V7a2 2 0 002-2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">My Courses</h3>
                    <p className="text-2xl font-bold text-green-600">{stats.totalCourses}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-1"
          >
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-500 rounded-full">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002 2v6a2 2 0 00-2 2H9a2 2 0 00-2-2V7a2 2 0 002-2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Assignments</h3>
                    <p className="text-2xl font-bold text-yellow-600">{stats.totalAssignments}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Courses List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-3"
          >
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">My Courses</h3>
                
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading courses...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courses.map((course, index) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-medium text-gray-900">{course.title}</h4>
                            <div className="mt-2 flex items-center space-x-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(course.category)}`}>
                                {course.category}
                              </span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(course.status)}`}>
                                {course.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{course.enrolledStudents} students enrolled</p>
                          </div>
                          <div className="ml-4">
                            <Link 
                              href={`/courses/${course.slug}`}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
                            >
                              View Course
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
