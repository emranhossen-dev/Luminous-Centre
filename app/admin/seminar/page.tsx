'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PhoneCall, 
  User, 
  Mail, 
  MessageCircle, 
  BookOpen, 
  Monitor, 
  Check, 
  X, 
  Clock, 
  Search, 
  Filter,
  ChevronDown,
  Edit,
  Save,
  XCircle,
  Trash2,
  Eye
} from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

interface Application {
  id: number;
  fullName: string;
  mobileNo: string;
  email: string;
  course: string;
  category: string;
  whatsappNo: string;
  status: 'waiting' | 'admitted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

const SeminarPage = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'waiting' | 'admitted' | 'rejected'>('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  
  // View & Edit Modal states
  const [selectedAppForView, setSelectedAppForView] = useState<Application | null>(null);
  const [selectedAppForEdit, setSelectedAppForEdit] = useState<Application | null>(null);
  const [editFormState, setEditFormState] = useState<Partial<Application>>({});
  const [savingEdit, setSavingEdit] = useState(false);

  const statusOptions = [
    { value: 'waiting', label: 'Waiting', icon: Clock, color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' },
    { value: 'admitted', label: 'Admitted', icon: Check, color: 'text-green-500 bg-green-500/10 border-green-500/20' },
    { value: 'rejected', label: 'Rejected', icon: X, color: 'text-red-500 bg-red-500/10 border-red-500/20' }
  ];

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter]);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/apply');
      const data = await response.json();
      
      if (data.success) {
        setApplications(data.applications);
      } else {
        toast.error('Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Error fetching applications');
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.mobileNo.includes(searchTerm) ||
        app.course.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
  };

  const updateApplicationStatus = async (applicationId: number, newStatus: string) => {
    setUpdatingStatus(applicationId);
    
    try {
      const response = await fetch(`/api/apply/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedApplication = await response.json();
        setApplications(prev => 
          prev.map(app => 
            app.id === applicationId 
              ? { ...app, status: newStatus as 'waiting' | 'admitted' | 'rejected', updatedAt: updatedApplication.updatedAt }
              : app
          )
        );
        setEditingId(null);
        toast.success(`Application status updated to ${newStatus}`);
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Failed to update application status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeleteApplication = async (applicationId: number, name: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete the seminar application for "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/apply/${applicationId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          Swal.fire({
            title: 'Deleted!',
            text: 'Application has been deleted.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
          setApplications(prev => prev.filter(app => app.id !== applicationId));
        } else {
          const data = await response.json();
          Swal.fire('Error!', data.error || 'Failed to delete application.', 'error');
        }
      } catch (err) {
        Swal.fire('Error!', 'A network error occurred.', 'error');
      }
    }
  };

  const handleSaveEditApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForEdit) return;

    try {
      setSavingEdit(true);
      const response = await fetch(`/api/apply/${selectedAppForEdit.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: editFormState.fullName,
          email: editFormState.email,
          mobileNo: editFormState.mobileNo,
          course: editFormState.course,
          category: editFormState.category,
          whatsappNo: editFormState.whatsappNo,
          status: editFormState.status
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Application updated successfully');
        setApplications(prev =>
          prev.map(app =>
            app.id === selectedAppForEdit.id
              ? {
                  ...app,
                  fullName: editFormState.fullName || app.fullName,
                  email: editFormState.email || app.email,
                  mobileNo: editFormState.mobileNo || app.mobileNo,
                  course: editFormState.course || app.course,
                  category: editFormState.category || app.category,
                  whatsappNo: editFormState.whatsappNo || app.whatsappNo,
                  status: editFormState.status as any || app.status,
                }
              : app
          )
        );
        setSelectedAppForEdit(null);
      } else {
        toast.error(data.error || 'Failed to update application');
      }
    } catch (error) {
      console.error('Error saving application:', error);
      toast.error('An error occurred while saving the application');
    } finally {
      setSavingEdit(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.icon : Clock;
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.color : 'text-gray-500 bg-gray-500/10 border-gray-500/20';
  };

  const getStatusLabel = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.label : 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-3 bg-blue-600/20 rounded-xl">
              <PhoneCall className="w-6 h-6 text-blue-400" />
            </div>
            Seminar Applications
          </h1>
          <p className="text-gray-400 mt-2">Manage and track course applications</p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Applications', value: applications.length, color: 'bg-blue-600/20 text-blue-400 border-blue-600/20' },
          { label: 'Waiting', value: applications.filter(app => app.status === 'waiting').length, color: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/20' },
          { label: 'Admitted', value: applications.filter(app => app.status === 'admitted').length, color: 'bg-green-600/20 text-green-400 border-green-600/20' },
          { label: 'Rejected', value: applications.filter(app => app.status === 'rejected').length, color: 'bg-red-600/20 text-red-400 border-red-600/20' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 rounded-xl border ${stat.color} backdrop-blur-sm`}
          >
            <p className="text-sm font-medium opacity-80">{stat.label}</p>
            <p className="text-2xl font-bold mt-2">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, mobile, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="appearance-none pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent cursor-pointer"
          >
            <option value="all" className="bg-gray-800">All Status</option>
            <option value="waiting" className="bg-gray-800">Waiting</option>
            <option value="admitted" className="bg-gray-800">Admitted</option>
            <option value="rejected" className="bg-gray-800">Rejected</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </motion.div>

      {/* Applications Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden"
      >
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full text-sm">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Applicant</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Course Details</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No applications found
                  </td>
                </tr>
              ) : (
                filteredApplications.map((application) => {
                  const StatusIcon = getStatusIcon(application.status);
                  const statusColor = getStatusColor(application.status);
                  
                  return (
                    <motion.tr
                      key={application.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                            {application.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-medium truncate max-w-[150px]" title={application.fullName}>
                              {application.fullName}
                            </p>
                            <p className="text-gray-400 text-xs">ID: #{application.id}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-gray-300 text-sm">
                            <Mail className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate max-w-[180px]" title={application.email}>
                              {application.email}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300 text-sm">
                            <PhoneCall className="w-3 h-3 flex-shrink-0" />
                            <span>{application.mobileNo}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300 text-sm">
                            <MessageCircle className="w-3 h-3 flex-shrink-0" />
                            <span>{application.whatsappNo}</span>
                          </div>
                          <div className="text-xs text-gray-400 font-medium pt-1">
                            Applied: {new Date(application.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-blue-400 flex-shrink-0" />
                            <span className="text-white font-medium truncate max-w-[200px]" title={application.course}>
                              {application.course}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-purple-300">
                            <Monitor className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{application.category}</span>
                          </div>
                          <div className="text-xs text-green-400 font-semibold bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-md inline-block">
                            Free (Seminar)
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${statusColor} whitespace-nowrap`}>
                          <StatusIcon className="w-3 h-3" />
                          {getStatusLabel(application.status)}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedAppForView(application)}
                            className="p-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/20 rounded-lg text-blue-400 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAppForEdit(application);
                              setEditFormState({ ...application });
                            }}
                            className="p-2 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-600/20 rounded-lg text-yellow-400 transition-colors"
                            title="Edit Applicant"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteApplication(application.id, application.fullName)}
                            className="p-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/20 rounded-lg text-red-400 transition-colors"
                            title="Delete Applicant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* View Application Details Modal */}
      {selectedAppForView && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedAppForView(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <User className="w-6 h-6 text-blue-400" />
                Applicant Details
              </h2>
              <button
                onClick={() => setSelectedAppForView(null)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile section */}
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                {selectedAppForView.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{selectedAppForView.fullName}</h3>
                <p className="text-gray-400 text-sm">ID: #{selectedAppForView.id}</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Student Info */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Student Information</h4>
                <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <Mail className="w-4 h-4 text-blue-400" />
                    <span>{selectedAppForView.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <PhoneCall className="w-4 h-4 text-green-400" />
                    <span>{selectedAppForView.mobileNo}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>{selectedAppForView.whatsappNo}</span>
                  </div>
                </div>
              </div>

              {/* Course Info */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Course Details</h4>
                <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Course:</span>
                    <span className="text-white font-medium">{selectedAppForView.course}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Category:</span>
                    <span className="text-white font-medium">{selectedAppForView.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Price:</span>
                    <span className="text-green-400 font-bold bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded">
                      Free (Seminar)
                    </span>
                  </div>
                </div>
              </div>

              {/* Status and date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Status</h4>
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(selectedAppForView.status)}`}>
                      {getStatusLabel(selectedAppForView.status)}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Applied Date</h4>
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-center text-white text-sm font-medium flex items-center justify-center h-[46px]">
                    {new Date(selectedAppForView.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
              <button
                onClick={() => setSelectedAppForView(null)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white rounded-xl transition text-sm font-bold"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Edit Application Details Modal */}
      {selectedAppForEdit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedAppForEdit(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Edit className="w-6 h-6 text-yellow-400" />
                Edit Application
              </h2>
              <button
                onClick={() => setSelectedAppForEdit(null)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditApplication} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={editFormState.fullName || ''}
                  onChange={(e) => setEditFormState({ ...editFormState, fullName: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    value={editFormState.mobileNo || ''}
                    onChange={(e) => setEditFormState({ ...editFormState, mobileNo: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">WhatsApp Number</label>
                  <input
                    type="text"
                    required
                    value={editFormState.whatsappNo || ''}
                    onChange={(e) => setEditFormState({ ...editFormState, whatsappNo: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status</label>
                  <select
                    value={editFormState.status || 'waiting'}
                    onChange={(e) => setEditFormState({ ...editFormState, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 text-sm font-semibold"
                  >
                    <option value="waiting" className="bg-gray-800">Waiting</option>
                    <option value="admitted" className="bg-gray-800">Admitted</option>
                    <option value="rejected" className="bg-gray-800">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Course Name</label>
                  <input
                    type="text"
                    required
                    value={editFormState.course || ''}
                    onChange={(e) => setEditFormState({ ...editFormState, course: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Course Category</label>
                  <input
                    type="text"
                    required
                    value={editFormState.category || ''}
                    onChange={(e) => setEditFormState({ ...editFormState, category: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setSelectedAppForEdit(null)}
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
    </div>
  );
};

export default SeminarPage;
