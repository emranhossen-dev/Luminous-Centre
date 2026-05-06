"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Course {
  id: number;
  title: string;
  slug: string;
  category: string;
  progress: number;
  thumbnailUrl?: string;
  instructor: string;
  description?: string;
}

interface Enrollment {
  id: number;
  courseId: number;
  enrolledAt: string;
  progress: number;
  status: string;
  courseTitle: string;
  thumbnailUrl?: string;
  category: string;
  instructor: string;
}

export default function StudentDashboard() {
  const [enrolledCourses, setEnrolledCourses] = useState<Enrollment[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'enrolled' | 'available'>('enrolled');

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch enrolled courses
      const enrolledResponse = await fetch('/api/student/enrollments', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (enrolledResponse.ok) {
        const enrolledData = await enrolledResponse.json();
        setEnrolledCourses(enrolledData.enrollments);
      }

      // Fetch available courses
      const availableResponse = await fetch('/api/courses?status=published', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (availableResponse.ok) {
        const availableData = await availableResponse.json();
        setAvailableCourses(availableData.courses);
      }
    } catch (error) {
      console.error('Failed to fetch student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const enrollInCourse = async (courseId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/student/enroll', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId }),
      });

      if (response.ok) {
        fetchStudentData(); // Refresh data
      } else {
        const error = await response.json();
        alert(error.error || 'Enrollment failed');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      alert('Network error. Please try again.');
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
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
          {/* Stats Card */}
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.35a4 4 0 100 8 4 4 0 000-8zm0 4a8 8 0 100 16 8 8 0 000-16z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">My Learning</h3>
                    <p className="text-2xl font-bold text-blue-600">{enrolledCourses.length}</p>
                    <p className="text-sm text-gray-600">Enrolled Courses</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Available Courses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="bg-white shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Available Courses</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setActiveTab('enrolled')}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        activeTab === 'enrolled'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      My Courses
                    </button>
                    <button
                      onClick={() => setActiveTab('available')}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        activeTab === 'available'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Browse Courses
                    </button>
                  </div>
                </div>

                {/* Course List */}
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading courses...</p>
                  </div>
                ) : activeTab === 'enrolled' ? (
                  <div className="space-y-4">
                    {enrolledCourses.map((enrollment) => (
                      <motion.div
                        key={enrollment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <img
                                src={enrollment.thumbnailUrl || '/placeholder-course.jpg'}
                                alt={enrollment.courseTitle}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                              <div className="ml-4">
                                <h4 className="text-lg font-medium text-gray-900">{enrollment.courseTitle}</h4>
                                <div className="mt-1 flex items-center space-x-4">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(enrollment.category)}`}>
                                    {enrollment.category}
                                  </span>
                                  <span className="text-sm text-gray-500">by {enrollment.instructor}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-2">Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <div className="text-sm text-gray-500">Progress:</div>
                              <div className="ml-2 w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${enrollment.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900">{enrollment.progress}%</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  activeTab === 'enrolled' ? (
                    enrolledCourses.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No courses enrolled yet</h3>
                        <p className="text-gray-600 mb-6">Start your learning journey by enrolling in a course below</p>
                        <button
                          onClick={() => setActiveTab('available')}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Browse Courses
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {enrolledCourses.map((enrollment) => (
                          <motion.div
                            key={enrollment.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <img
                                    src={enrollment.thumbnailUrl || '/placeholder-course.jpg'}
                                    alt={enrollment.courseTitle}
                                    className="w-16 h-16 rounded-lg object-cover"
                                  />
                                  <div className="ml-4">
                                    <h4 className="text-lg font-medium text-gray-900">{enrollment.courseTitle}</h4>
                                    <div className="mt-1 flex items-center space-x-4">
                                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(enrollment.category)}`}>
                                        {enrollment.category}
                                      </span>
                                      <span className="text-sm text-gray-500">by {enrollment.instructor}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2">Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="flex items-center">
                                  <div className="text-sm text-gray-500">Progress:</div>
                                  <div className="ml-2 w-24 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full"
                                      style={{ width: `${enrollment.progress}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium text-gray-900">{enrollment.progress}%</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {availableCourses.map((course) => (
                        <motion.div
                          key={course.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md cursor-pointer"
                          onClick={() => enrollInCourse(course.id)}
                        >
                          <div className="flex items-start">
                            <img
                              src={course.thumbnailUrl || '/placeholder-course.jpg'}
                              alt={course.title}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="ml-4 flex-1">
                              <h4 className="text-lg font-medium text-gray-900">{course.title}</h4>
                              <div className="mt-1 flex items-center space-x-4">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(course.category)}`}>
                                  {course.category}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{course.description}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
