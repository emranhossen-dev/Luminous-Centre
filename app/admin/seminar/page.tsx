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
  XCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Applicant</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Course</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Applied</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
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
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                            {application.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-medium">{application.fullName}</p>
                            <p className="text-gray-400 text-sm">ID: #{application.id}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-gray-300 text-sm">
                            <Mail className="w-3 h-3" />
                            {application.email}
                          </div>
                          <div className="flex items-center gap-2 text-gray-300 text-sm">
                            <PhoneCall className="w-3 h-3" />
                            {application.mobileNo}
                          </div>
                          <div className="flex items-center gap-2 text-gray-300 text-sm">
                            <MessageCircle className="w-3 h-3" />
                            {application.whatsappNo}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-400" />
                          <span className="text-white">{application.course}</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4 text-purple-400" />
                          <span className="text-white">{application.category}</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        {editingId === application.id ? (
                          <select
                            value={application.status}
                            onChange={(e) => updateApplicationStatus(application.id, e.target.value)}
                            className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            disabled={updatingStatus === application.id}
                          >
                            {statusOptions.map(option => (
                              <option key={option.value} value={option.value} className="bg-gray-800">
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${statusColor}`}>
                            <StatusIcon className="w-3 h-3" />
                            {getStatusLabel(application.status)}
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4">
                        <p className="text-gray-300 text-sm">
                          {new Date(application.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {editingId === application.id ? (
                            <>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                                disabled={updatingStatus === application.id}
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setEditingId(application.id)}
                              className="p-2 text-gray-400 hover:text-white transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
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
    </div>
  );
};

export default SeminarPage;
