'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Phone, Mail, CreditCard, Calendar, Filter,
  Search, Eye, Edit2, Save, X, CheckCircle, Clock,
  AlertCircle, Users, FileText, Loader2
} from 'lucide-react';
import { useLoading } from '@/contexts/LoadingContext';

type EnrollmentStatus = 'applied' | 'waiting' | 'admitted' | 'rejected' | 'next_batch';
type PaymentStatus = 'pending' | 'verified' | 'failed';
type CourseTypeFilter = 'all' | 'recorded_course' | 'offline_course' | 'online_course' | 'govt_project';

interface Enrollment {
  id: number;
  full_name: string;
  mobile_number: string;
  email: string;
  payment_method: string;
  payment_status: PaymentStatus;
  enrollment_status: EnrollmentStatus;
  amount: number;
  currency: string;
  transaction_id: string;
  payment_screenshot_url: string;
  course_title: string;
  course_category: string;
  course_price: number;
  batch_name: string;
  admin_note: string;
  created_at: string;
  reviewed_at: string;
}

export default function EnrollmentsPage() {
  const { startLoading } = useLoading();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseTypeFilter, setCourseTypeFilter] = useState<CourseTypeFilter>('all');
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const enrollmentsRes = await fetch('/api/admin/enhanced-enrollments', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (enrollmentsRes.ok) {
        const enrollmentsData = await enrollmentsRes.json();
        setEnrollments(enrollmentsData.enrollments || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateEnrollmentStatus = async (enrollmentId: number, status: EnrollmentStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/enhanced-enrollments/${enrollmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ enrollment_status: status })
      });

      if (response.ok) {
        fetchData();
        setSelectedEnrollment(null);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const updatePaymentStatus = async (enrollmentId: number, status: PaymentStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/enhanced-enrollments/${enrollmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ payment_status: status })
      });

      if (response.ok) {
        fetchData();
        setSelectedEnrollment(null);
      }
    } catch (error) {
      console.error('Failed to update payment status:', error);
    }
  };

  const updateAdminNote = async (id: number, note: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/enhanced-enrollments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ admin_note: note })
      });

      if (response.ok) {
        fetchData();
        setEditingNote(false);
        setNoteText('');
      }
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  // Filter enrollments based on course type
  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = 
      enrollment.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.mobile_number.includes(searchTerm) ||
      enrollment.course_title.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesCourseType = true;
    if (courseTypeFilter !== 'all') {
      switch (courseTypeFilter) {
        case 'recorded_course':
          matchesCourseType = enrollment.course_category?.toLowerCase().includes('recorded');
          break;
        case 'offline_course':
          matchesCourseType = enrollment.course_category?.toLowerCase().includes('offline');
          break;
        case 'online_course':
          matchesCourseType = enrollment.course_category?.toLowerCase().includes('online');
          break;
        case 'govt_project':
          matchesCourseType = enrollment.course_category?.toLowerCase().includes('govt') || 
                           enrollment.course_category?.toLowerCase().includes('government') || 
                           enrollment.course_category?.toLowerCase().includes('project');
          break;
      }
    }

    return matchesSearch && matchesCourseType;
  });

  // Calculate counts for each filter
  const allCount = enrollments.length;
  const recordedCourseCount = enrollments.filter(e => 
    e.course_category?.toLowerCase().includes('recorded')).length;
  const offlineCourseCount = enrollments.filter(e => 
    e.course_category?.toLowerCase().includes('offline')).length;
  const onlineCourseCount = enrollments.filter(e => 
    e.course_category?.toLowerCase().includes('online')).length;
  const govtProjectCount = enrollments.filter(e => 
    e.course_category?.toLowerCase().includes('govt') || 
    e.course_category?.toLowerCase().includes('government') || 
    e.course_category?.toLowerCase().includes('project')).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'admitted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'next_batch': return 'bg-purple-100 text-purple-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'waitlisted': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Enrollments</h1>
          <p className="text-gray-300">Manage course enrollment applications</p>
        </motion.div>

        {/* Course Type Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/20"
        >
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setCourseTypeFilter('all')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                courseTypeFilter === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              All ({allCount})
            </button>
            <button
              onClick={() => setCourseTypeFilter('recorded_course')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                courseTypeFilter === 'recorded_course'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              Recorded Course ({recordedCourseCount})
            </button>
            <button
              onClick={() => setCourseTypeFilter('offline_course')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                courseTypeFilter === 'offline_course'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              Offline Course ({offlineCourseCount})
            </button>
            <button
              onClick={() => setCourseTypeFilter('online_course')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                courseTypeFilter === 'online_course'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              Online Course ({onlineCourseCount})
            </button>
            <button
              onClick={() => setCourseTypeFilter('govt_project')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                courseTypeFilter === 'govt_project'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              Govt Project ({govtProjectCount})
            </button>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/20"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
        </motion.div>

        {/* Enrollments List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {filteredEnrollments.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 text-center border border-white/20">
              <p className="text-gray-300">No enrollments found</p>
            </div>
          ) : (
            filteredEnrollments.map((enrollment) => (
              <motion.div
                key={enrollment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">{enrollment.full_name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-300">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {enrollment.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {enrollment.mobile_number}
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            {enrollment.course_title} - {enrollment.amount} {enrollment.currency}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {enrollment.batch_name}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(enrollment.enrollment_status)}`}>
                            {enrollment.enrollment_status.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(enrollment.payment_status)}`}>
                            Payment: {enrollment.payment_status}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(enrollment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedEnrollment(enrollment);
                        setNoteText(enrollment.admin_note || '');
                      }}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Enrollment Details Modal */}
        {selectedEnrollment && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-white">Enrollment Details</h2>
                <button
                  onClick={() => setSelectedEnrollment(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Student Information */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Student Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">Full Name</label>
                      <p className="text-white">{selectedEnrollment.full_name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Email</label>
                      <p className="text-white">{selectedEnrollment.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Mobile Number</label>
                      <p className="text-white">{selectedEnrollment.mobile_number}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Transaction ID</label>
                      <p className="text-white">{selectedEnrollment.transaction_id}</p>
                    </div>
                  </div>
                </div>

                {/* Course Information */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Course Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">Course Title</label>
                      <p className="text-white">{selectedEnrollment.course_title}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Category</label>
                      <p className="text-white">{selectedEnrollment.course_category}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Amount</label>
                      <p className="text-white">{selectedEnrollment.amount} {selectedEnrollment.currency}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Batch</label>
                      <p className="text-white">{selectedEnrollment.batch_name}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Screenshot */}
                {selectedEnrollment.payment_screenshot_url && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Payment Screenshot</h3>
                    <img
                      src={selectedEnrollment.payment_screenshot_url}
                      alt="Payment Screenshot"
                      className="w-full max-w-md rounded-xl border border-white/20"
                    />
                  </div>
                )}

                {/* Status Management */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Status Management</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400">Enrollment Status</label>
                      <select
                        value={selectedEnrollment.enrollment_status}
                        onChange={(e) => updateEnrollmentStatus(selectedEnrollment.id, e.target.value as EnrollmentStatus)}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                      >
                        <option value="applied">Applied</option>
                        <option value="waiting">Waiting</option>
                        <option value="admitted">Admitted</option>
                        <option value="rejected">Rejected</option>
                        <option value="next_batch">Next Batch</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Payment Status</label>
                      <select
                        value={selectedEnrollment.payment_status}
                        onChange={(e) => updatePaymentStatus(selectedEnrollment.id, e.target.value as PaymentStatus)}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                      >
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Admin Notes */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Admin Notes</h3>
                  {editingNote ? (
                    <div className="space-y-3">
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add notes about this enrollment..."
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        rows={4}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateAdminNote(selectedEnrollment.id, noteText)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl text-white transition-all flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          Save Note
                        </button>
                        <button
                          onClick={() => {
                            setEditingNote(false);
                            setNoteText(selectedEnrollment.admin_note || '');
                          }}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-xl text-white transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-gray-300">
                        {selectedEnrollment.admin_note || 'No notes added yet.'}
                      </p>
                      <button
                        onClick={() => setEditingNote(true)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-white transition-all flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Note
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
