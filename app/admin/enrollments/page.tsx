'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Phone, Mail, CreditCard, Calendar, Filter,
  Search, Eye, Edit2, Save, X, CheckCircle, Clock,
  AlertCircle, Users, FileText, Loader2, Trash2, BookOpen, MessageCircle
} from 'lucide-react';
import { useLoading } from '@/contexts/LoadingContext';
import Swal from 'sweetalert2';

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
  promo_code?: string;
  whatsapp_number?: string;
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

  // Edit Modal states
  const [selectedEnrollmentForEdit, setSelectedEnrollmentForEdit] = useState<Enrollment | null>(null);
  const [editFormState, setEditFormState] = useState<Partial<Enrollment>>({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Course Direct Assignment Modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [assignAmount, setAssignAmount] = useState('');
  const [assignPaymentMethod, setAssignPaymentMethod] = useState('cash');
  const [assigning, setAssigning] = useState(false);

  const handleOpenAssignModal = async () => {
    setAssignModalOpen(true);
    try {
      const token = localStorage.getItem('adminToken');
      
      // Fetch students
      const studentsRes = await fetch('/api/admin/users?role=student&limit=500', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (studentsRes.ok) {
        const data = await studentsRes.json();
        setAllStudents(data.users || []);
      }

      // Fetch courses
      const coursesRes = await fetch('/api/admin/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (coursesRes.ok) {
        const data = await coursesRes.json();
        setAllCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Failed to prefetch assign course data:', error);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedCourseId) {
      alert('Please select both a student and a course');
      return;
    }

    setAssigning(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: parseInt(selectedStudentId),
          courseId: parseInt(selectedCourseId),
          amount: assignAmount ? parseFloat(assignAmount) : undefined,
          paymentMethod: assignPaymentMethod
        })
      });

      if (response.ok) {
        alert('Course assigned successfully! 🚀');
        setAssignModalOpen(false);
        setSelectedStudentId('');
        setSelectedCourseId('');
        setAssignAmount('');
        setAssignPaymentMethod('cash');
        fetchData(); // Refresh enrollments list
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to assign course');
      }
    } catch (error) {
      console.error('Assign course error:', error);
      alert('An error occurred while assigning the course');
    } finally {
      setAssigning(false);
    }
  };

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

  const handleDeleteEnrollment = async (requestId: number, studentName: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete the enrollment for "${studentName}"? This will also revoke their active course access.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`/api/admin/enrollment-requests/${requestId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          Swal.fire({
            title: 'Deleted!',
            text: 'Enrollment has been deleted.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
          setEnrollments(prev => prev.filter(e => e.id !== requestId));
        } else {
          const data = await response.json();
          Swal.fire('Error!', data.error || 'Failed to delete enrollment.', 'error');
        }
      } catch (err) {
        Swal.fire('Error!', 'A network error occurred.', 'error');
      }
    }
  };

  const handleSaveEditEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnrollmentForEdit) return;

    try {
      setSavingEdit(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/enhanced-enrollments/${selectedEnrollmentForEdit.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: editFormState.full_name,
          email: editFormState.email,
          mobile_number: editFormState.mobile_number,
          whatsapp_number: editFormState.whatsapp_number,
          course_title: editFormState.course_title,
          course_category: editFormState.course_category,
          batch_name: editFormState.batch_name,
          amount: editFormState.amount ? parseFloat(editFormState.amount as any) : 0,
          promo_code: editFormState.promo_code,
          enrollment_status: editFormState.enrollment_status,
          payment_status: editFormState.payment_status
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'Saved!',
          text: 'Enrollment details updated successfully.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        setEnrollments(prev =>
          prev.map(e =>
            e.id === selectedEnrollmentForEdit.id
              ? {
                  ...e,
                  full_name: editFormState.full_name || e.full_name,
                  email: editFormState.email || e.email,
                  mobile_number: editFormState.mobile_number || e.mobile_number,
                  whatsapp_number: editFormState.whatsapp_number !== undefined ? editFormState.whatsapp_number : e.whatsapp_number,
                  course_title: editFormState.course_title || e.course_title,
                  course_category: editFormState.course_category || e.course_category,
                  batch_name: editFormState.batch_name || e.batch_name,
                  amount: editFormState.amount ? parseFloat(editFormState.amount as any) : e.amount,
                  promo_code: editFormState.promo_code !== undefined ? editFormState.promo_code : e.promo_code,
                  enrollment_status: editFormState.enrollment_status || e.enrollment_status,
                  payment_status: editFormState.payment_status || e.payment_status
                }
              : e
          )
        );
        setSelectedEnrollmentForEdit(null);
      } else {
        Swal.fire('Error!', data.error || 'Failed to update enrollment.', 'error');
      }
    } catch (error) {
      console.error('Error saving enrollment:', error);
      Swal.fire('Error!', 'An error occurred while saving enrollment.', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const updateEnrollmentStatus = async (enrollmentId: number, status: EnrollmentStatus, studentName: string) => {
    const result = await Swal.fire({
      title: 'Change Status?',
      text: `Are you sure you want to change the enrollment status of "${studentName}" to "${status.toUpperCase()}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, change it!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) {
      // Re-fetch data to reset dropdown state to previous value
      fetchData();
      return;
    }

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
        Swal.fire({
          title: 'Updated!',
          text: `Enrollment status updated to "${status.toUpperCase()}" successfully.`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        fetchData();
      } else {
        const data = await response.json();
        Swal.fire('Error!', data.error || 'Failed to update status.', 'error');
        fetchData();
      }
    } catch (error) {
      console.error('Error updating enrollment status:', error);
      Swal.fire('Error!', 'A network error occurred.', 'error');
      fetchData();
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
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Enrollments</h1>
            <p className="text-gray-300">Manage course enrollment applications</p>
          </div>
          <button
            onClick={handleOpenAssignModal}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-blue-500/20 active:scale-[0.98]"
          >
            Assign Course
          </button>
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
          <div className="overflow-x-auto w-full max-w-full">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-gray-300 font-medium">Student</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Contact</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Course Details</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {enrollment.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate max-w-[150px]" title={enrollment.full_name}>
                            {enrollment.full_name}
                          </p>
                          <p className="text-gray-400 text-xs">ID: #{enrollment.id}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-300 text-sm">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate max-w-[180px]" title={enrollment.email}>
                            {enrollment.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300 text-sm">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          <span>{enrollment.mobile_number}</span>
                        </div>
                        {enrollment.whatsapp_number && (
                          <div className="flex items-center gap-2 text-gray-300 text-sm">
                            <MessageCircle className="w-3 h-3 flex-shrink-0" />
                            <span>{enrollment.whatsapp_number}</span>
                          </div>
                        )}
                        <div className="text-xs text-gray-400 font-medium pt-1">
                          Applied: {new Date(enrollment.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <span className="text-white font-medium truncate max-w-[200px]" title={enrollment.course_title}>
                            {enrollment.course_title}
                          </span>
                        </div>
                        <div className="text-xs text-purple-300">
                          Category: {enrollment.course_category} | Batch: {enrollment.batch_name}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-white font-semibold bg-white/10 px-2 py-0.5 rounded text-xs">
                            {enrollment.amount} {enrollment.currency}
                          </span>
                          {enrollment.promo_code && (
                            <span className="text-yellow-400 font-bold bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded text-xs">
                              Promo: {enrollment.promo_code}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <select
                        value={enrollment.enrollment_status}
                        onChange={(e) => updateEnrollmentStatus(enrollment.id, e.target.value as EnrollmentStatus, enrollment.full_name)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium border bg-black text-white focus:ring-1 focus:ring-blue-500 ${
                          enrollment.enrollment_status === 'applied' ? 'bg-blue-600/20 text-blue-400 border-blue-600/20' :
                          enrollment.enrollment_status === 'waiting' ? 'bg-yellow-600/20 text-yellow-400 border-yellow-600/20' :
                          enrollment.enrollment_status === 'admitted' ? 'bg-green-600/20 text-green-400 border-green-600/20' :
                          enrollment.enrollment_status === 'rejected' ? 'bg-red-600/20 text-red-400 border-red-600/20' :
                          'bg-purple-600/20 text-purple-400 border-purple-600/20'
                        }`}
                      >
                        <option value="applied" className="bg-gray-800">Applied</option>
                        <option value="waiting" className="bg-gray-800">Waiting</option>
                        <option value="admitted" className="bg-gray-800">Admitted</option>
                        <option value="rejected" className="bg-gray-800">Rejected</option>
                        <option value="next_batch" className="bg-gray-800">Next Batch</option>
                      </select>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedEnrollment(enrollment);
                            setNoteText(enrollment.admin_note || '');
                            setEditingNote(false);
                          }}
                          className="p-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/20 rounded-lg text-blue-400 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEnrollmentForEdit(enrollment);
                            setEditFormState({ ...enrollment });
                          }}
                          className="p-2 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-600/20 rounded-lg text-yellow-400 transition-colors"
                          title="Edit Enrollment"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEnrollment(enrollment.id, enrollment.full_name)}
                          className="p-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/20 rounded-lg text-red-400 transition-colors"
                          title="Delete Enrollment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
                    {selectedEnrollment.whatsapp_number && (
                      <div className="flex items-center gap-3">
                        <MessageCircle className="w-4 h-4 text-emerald-400" />
                        <p className="text-white">{selectedEnrollment.whatsapp_number}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Course Information</h3>
                  <div className="space-y-2">
                    <p className="text-white"><span className="text-gray-400">Course:</span> {selectedEnrollment.course_title}</p>
                    <p className="text-white"><span className="text-gray-400">Category:</span> {selectedEnrollment.course_category}</p>
                    <p className="text-white"><span className="text-gray-400">Batch:</span> {selectedEnrollment.batch_name}</p>
                    <p className="text-white"><span className="text-gray-400">Price:</span> {selectedEnrollment.amount} {selectedEnrollment.currency}</p>
                    {selectedEnrollment.promo_code && (
                      <p className="text-white">
                        <span className="text-gray-400">Promo Code:</span>{' '}
                        <span className="text-yellow-400 font-bold bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded text-xs ml-1 font-semibold">
                          {selectedEnrollment.promo_code}
                        </span>
                      </p>
                    )}
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

        {/* Edit Enrollment Details Modal */}
        {selectedEnrollmentForEdit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedEnrollmentForEdit(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Edit2 className="w-6 h-6 text-yellow-400" />
                  Edit Enrollment Details
                </h2>
                <button
                  onClick={() => setSelectedEnrollmentForEdit(null)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditEnrollment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Student Full Name</label>
                  <input
                    type="text"
                    required
                    value={editFormState.full_name || ''}
                    onChange={(e) => setEditFormState({ ...editFormState, full_name: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 text-sm font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      value={editFormState.email || ''}
                      onChange={(e) => setEditFormState({ ...editFormState, email: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Mobile Number</label>
                    <input
                      type="text"
                      required
                      value={editFormState.mobile_number || ''}
                      onChange={(e) => setEditFormState({ ...editFormState, mobile_number: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">WhatsApp Number</label>
                    <input
                      type="text"
                      value={editFormState.whatsapp_number || ''}
                      onChange={(e) => setEditFormState({ ...editFormState, whatsapp_number: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Course Title</label>
                    <input
                      type="text"
                      required
                      value={editFormState.course_title || ''}
                      onChange={(e) => setEditFormState({ ...editFormState, course_title: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Course Category</label>
                    <input
                      type="text"
                      required
                      value={editFormState.course_category || ''}
                      onChange={(e) => setEditFormState({ ...editFormState, course_category: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Price (Amount)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editFormState.amount || 0}
                      onChange={(e) => setEditFormState({ ...editFormState, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Promo Code</label>
                    <input
                      type="text"
                      value={editFormState.promo_code || ''}
                      onChange={(e) => setEditFormState({ ...editFormState, promo_code: e.target.value })}
                      placeholder="None"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Batch Name</label>
                    <input
                      type="text"
                      value={editFormState.batch_name || ''}
                      onChange={(e) => setEditFormState({ ...editFormState, batch_name: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Enrollment Status</label>
                    <select
                      value={editFormState.enrollment_status || 'applied'}
                      onChange={(e) => setEditFormState({ ...editFormState, enrollment_status: e.target.value as any })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 text-sm font-semibold"
                    >
                      <option value="applied" className="bg-gray-800">Applied</option>
                      <option value="waiting" className="bg-gray-800">Waiting</option>
                      <option value="admitted" className="bg-gray-800">Admitted</option>
                      <option value="rejected" className="bg-gray-800">Rejected</option>
                      <option value="next_batch" className="bg-gray-800">Next Batch</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Status</label>
                    <select
                      value={editFormState.payment_status || 'pending'}
                      onChange={(e) => setEditFormState({ ...editFormState, payment_status: e.target.value as any })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 text-sm font-semibold"
                    >
                      <option value="pending" className="bg-gray-800">Pending</option>
                      <option value="verified" className="bg-gray-800">Verified</option>
                      <option value="failed" className="bg-gray-800">Failed</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setSelectedEnrollmentForEdit(null)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white text-sm font-bold rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-bold rounded-xl transition flex items-center gap-1.5"
                  >
                    {savingEdit ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Course Assignment Modal */}
        {assignModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900 rounded-3xl p-8 border border-white/10 shadow-2xl max-w-md w-full"
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-white">Assign Course</h2>
                <button
                  onClick={() => setAssignModalOpen(false)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAssignSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Select Student User <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 text-sm"
                  >
                    <option value="">Select a student...</option>
                    {allStudents.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.first_name} {student.last_name} ({student.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Select Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => {
                      setSelectedCourseId(e.target.value);
                      const course = allCourses.find(c => c.id === parseInt(e.target.value));
                      if (course) {
                        setAssignAmount(course.price ? course.price.toString() : '0');
                      }
                    }}
                    required
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 text-sm"
                  >
                    <option value="">Select a course...</option>
                    {allCourses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.title} ({course.price || 'Free'} BDT)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Custom Amount (BDT)
                    </label>
                    <input
                      type="number"
                      placeholder="Price"
                      value={assignAmount}
                      onChange={(e) => setAssignAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Payment Method
                    </label>
                    <select
                      value={assignPaymentMethod}
                      onChange={(e) => setAssignPaymentMethod(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 text-sm"
                    >
                      <option value="cash">Cash</option>
                      <option value="bkash">bKash</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="free">Free / Guest</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setAssignModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white text-xs font-bold rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={assigning}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                  >
                    {assigning ? 'Assigning...' : 'Assign Course'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </div>
  );
}
