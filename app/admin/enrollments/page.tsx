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
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
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
      
      console.log('Fetching enrollments with token:', token ? 'exists' : 'missing');
      
      if (!token) {
        console.error('No admin token found in localStorage');
        setEnrollments([]);
        return;
      }
      
      const enrollmentsRes = await fetch('/api/admin/enhanced-enrollments', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Enrollments API response status:', enrollmentsRes.status);

      if (!enrollmentsRes.ok) {
        const errorText = await enrollmentsRes.text();
        console.error('API error:', errorText);
        throw new Error(`Failed to fetch enrollments: ${enrollmentsRes.status}`);
      }

      const data = await enrollmentsRes.json();
      console.log('Enrollments data received:', data.enrollments?.length || 0, 'items');
      setEnrollments(data.enrollments || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setEnrollments([]);
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
      }
    } catch (error) {
      console.error('Error updating enrollment status:', error);
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
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
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
      }
    } catch (error) {
      console.error('Error updating admin note:', error);
    }
  };

  // Filter enrollments based on all filters
  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = 
      enrollment.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.mobile_number.includes(searchTerm);

    const matchesCourseType = courseTypeFilter === 'all' || 
      (courseTypeFilter === 'recorded_course' && enrollment.course_category?.toLowerCase().includes('recorded')) ||
      (courseTypeFilter === 'offline_course' && enrollment.course_category?.toLowerCase().includes('offline')) ||
      (courseTypeFilter === 'online_course' && enrollment.course_category?.toLowerCase().includes('online')) ||
      (courseTypeFilter === 'govt_project' && (
        enrollment.course_category?.toLowerCase().includes('government') || 
        enrollment.course_category?.toLowerCase().includes('project') ||
        enrollment.course_category?.toLowerCase().includes('govt')
      ));

    const matchesCourse = courseFilter === 'all' || enrollment.course_title === courseFilter;
    
    const matchesStatus = statusFilter === 'all' || enrollment.enrollment_status === statusFilter;
    
    const matchesPaymentStatus = paymentStatusFilter === 'all' || enrollment.payment_status === paymentStatusFilter;

    return matchesSearch && matchesCourseType && matchesCourse && matchesStatus && matchesPaymentStatus;
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
    e.course_category?.toLowerCase().includes('government') || 
    e.course_category?.toLowerCase().includes('project') ||
    e.course_category?.toLowerCase().includes('govt')).length;

  // Calculate status counts
  const appliedCount = enrollments.filter(e => e.enrollment_status === 'applied').length;
  const waitingCount = enrollments.filter(e => e.enrollment_status === 'waiting').length;
  const admittedCount = enrollments.filter(e => e.enrollment_status === 'admitted').length;
  const rejectedCount = enrollments.filter(e => e.enrollment_status === 'rejected').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/10"
        >
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setCourseTypeFilter('all')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                courseTypeFilter === 'all'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-600/20'
                  : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              All ({allCount})
            </button>
            <button
              onClick={() => setCourseTypeFilter('recorded_course')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                courseTypeFilter === 'recorded_course'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-600/20'
                  : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              Recorded Course ({recordedCourseCount})
            </button>
            <button
              onClick={() => setCourseTypeFilter('offline_course')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                courseTypeFilter === 'offline_course'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-600/20'
                  : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              Offline Course ({offlineCourseCount})
            </button>
            <button
              onClick={() => setCourseTypeFilter('online_course')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                courseTypeFilter === 'online_course'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-600/20'
                  : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              Online Course ({onlineCourseCount})
            </button>
            <button
              onClick={() => setCourseTypeFilter('govt_project')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                courseTypeFilter === 'govt_project'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-600/20'
                  : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              Govt Project ({govtProjectCount})
            </button>
          </div>
        </motion.div>

        {/* Status Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
            <p className="text-sm text-gray-400 mb-1">Applied</p>
            <p className="text-2xl font-bold text-blue-400">{appliedCount}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
            <p className="text-sm text-gray-400 mb-1">Waiting</p>
            <p className="text-2xl font-bold text-yellow-400">{waitingCount}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
            <p className="text-sm text-gray-400 mb-1">Admitted</p>
            <p className="text-2xl font-bold text-green-400">{admittedCount}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
            <p className="text-sm text-gray-400 mb-1">Rejected</p>
            <p className="text-2xl font-bold text-red-400">{rejectedCount}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
            <p className="text-sm text-gray-400 mb-1">Total</p>
            <p className="text-2xl font-bold text-purple-400">{allCount}</p>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/10"
        >
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
            
            {/* Advanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Course Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Course</label>
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-black border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                >
                  <option value="all">All Courses</option>
                  {Array.from(new Set(enrollments.map(e => e.course_title))).filter(Boolean).map(course => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Application Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-black border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="applied">Applied</option>
                  <option value="waiting">Waiting</option>
                  <option value="admitted">Admitted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              {/* Payment Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Payment Status</label>
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-black border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                >
                  <option value="all">All Payment Status</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              
              {/* Clear Filters Button */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCourseFilter('all');
                    setStatusFilter('all');
                    setPaymentStatusFilter('all');
                    setCourseTypeFilter('all');
                  }}
                  className="w-full px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/20 rounded-lg hover:bg-red-600/30 transition-all font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enrollments List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-gray-300 font-medium">Student</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Course</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Amount</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Payment</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Date</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="text-white font-medium">{enrollment.full_name}</p>
                        <p className="text-gray-400 text-sm">{enrollment.email}</p>
                        <p className="text-gray-400 text-sm">{enrollment.mobile_number}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-white font-medium">{enrollment.course_title}</p>
                        <p className="text-gray-400 text-sm">{enrollment.course_category}</p>
                        <p className="text-gray-400 text-sm">{enrollment.batch_name}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-white font-medium">{enrollment.amount} {enrollment.currency}</p>
                      <p className="text-gray-400 text-sm">ID: {enrollment.transaction_id}</p>
                    </td>
                    <td className="p-4">
                      <select
                        value={enrollment.enrollment_status}
                        onChange={(e) => updateEnrollmentStatus(enrollment.id, e.target.value as EnrollmentStatus)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium border ${
                          enrollment.enrollment_status === 'applied' ? 'bg-blue-600/20 text-blue-400 border-blue-600/20' :
                          enrollment.enrollment_status === 'waiting' ? 'bg-yellow-600/20 text-yellow-400 border-yellow-600/20' :
                          enrollment.enrollment_status === 'admitted' ? 'bg-green-600/20 text-green-400 border-green-600/20' :
                          enrollment.enrollment_status === 'rejected' ? 'bg-red-600/20 text-red-400 border-red-600/20' :
                          'bg-purple-600/20 text-purple-400 border-purple-600/20'
                        }`}
                      >
                        <option value="applied">Applied</option>
                        <option value="waiting">Waiting</option>
                        <option value="admitted">Admitted</option>
                        <option value="rejected">Rejected</option>
                        <option value="next_batch">Next Batch</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <select
                        value={enrollment.payment_status}
                        onChange={(e) => updatePaymentStatus(enrollment.id, e.target.value as PaymentStatus)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium border ${
                          enrollment.payment_status === 'pending' ? 'bg-yellow-600/20 text-yellow-400 border-yellow-600/20' :
                          enrollment.payment_status === 'verified' ? 'bg-green-600/20 text-green-400 border-green-600/20' :
                          'bg-red-600/20 text-red-400 border-red-600/20'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="failed">Failed</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <p className="text-gray-300 text-sm">
                        {new Date(enrollment.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => {
                          setSelectedEnrollment(enrollment);
                          setNoteText(enrollment.admin_note || '');
                          setEditingNote(false);
                        }}
                        className="p-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/20 rounded-lg text-blue-400 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredEnrollments.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">No enrollments found</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Enrollment Details Modal */}
        {selectedEnrollment && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedEnrollment(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-white">Enrollment Details</h2>
                <button
                  onClick={() => setSelectedEnrollment(null)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-gray-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Student Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-gray-400" />
                      <p className="text-white">{selectedEnrollment.full_name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="text-white">{selectedEnrollment.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <p className="text-white">{selectedEnrollment.mobile_number}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Course Information</h3>
                  <div className="space-y-2">
                    <p className="text-white"><span className="text-gray-400">Course:</span> {selectedEnrollment.course_title}</p>
                    <p className="text-white"><span className="text-gray-400">Category:</span> {selectedEnrollment.course_category}</p>
                    <p className="text-white"><span className="text-gray-400">Batch:</span> {selectedEnrollment.batch_name}</p>
                    <p className="text-white"><span className="text-gray-400">Price:</span> {selectedEnrollment.amount} {selectedEnrollment.currency}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Payment Information</h3>
                <div className="space-y-2">
                  <p className="text-white"><span className="text-gray-400">Transaction ID:</span> {selectedEnrollment.transaction_id}</p>
                  <p className="text-white"><span className="text-gray-400">Payment Method:</span> {selectedEnrollment.payment_method}</p>
                  <p className="text-white"><span className="text-gray-400">Payment Status:</span> {selectedEnrollment.payment_status}</p>
                  {selectedEnrollment.payment_screenshot_url && (
                    <div>
                      <p className="text-gray-400 mb-2">Payment Screenshot:</p>
                      <img 
                        src={selectedEnrollment.payment_screenshot_url} 
                        alt="Payment Screenshot" 
                        className="max-w-xs rounded-lg border border-white/10"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-white">Admin Notes</h3>
                  {!editingNote && (
                    <button
                      onClick={() => setEditingNote(true)}
                      className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/20 rounded-xl text-blue-400 transition-all flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Note
                    </button>
                  )}
                </div>
                
                {editingNote ? (
                  <div className="space-y-3">
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add admin notes here..."
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
                      rows={4}
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => updateAdminNote(selectedEnrollment.id, noteText)}
                        className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-600/20 rounded-xl text-green-400 transition-all flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save Note
                      </button>
                      <button
                        onClick={() => {
                          setEditingNote(false);
                          setNoteText(selectedEnrollment.admin_note || '');
                        }}
                        className="px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 border border-gray-600/20 rounded-xl text-gray-400 transition-all"
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
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
  );
}
