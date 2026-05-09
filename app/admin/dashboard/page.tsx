"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import EnrollmentRequestDetails from '../components/EnrollmentRequestDetails';

interface Stats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  activeUsers: number;
  newUsers: number;
}

interface EnrollmentRequest {
  id: number;
  user_id: number;
  course_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  course_title: string;
  payment_method: string;
  payment_status: string;
  enrollment_status: string;
  amount: number;
  currency: string;
  payer_name?: string;
  payer_mobile?: string;
  payment_mobile?: string;
  payment_mobile_last3?: string;
  transaction_id?: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    activeUsers: 0,
    newUsers: 0
  });
  const [requests, setRequests] = useState<EnrollmentRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<EnrollmentRequest | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const statsRes = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      const reqRes = await fetch('/api/admin/enrollment-requests?status=pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setRequests(reqData.requests || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue', trend: '+12.5%' },
    { label: 'Total Courses', value: stats.totalCourses, icon: BookOpen, color: 'emerald', trend: '+4.3%' },
    { label: 'Total Enrollments', value: stats.totalEnrollments, icon: GraduationCap, color: 'violet', trend: '+18.2%' },
  ];

  const updateRequest = async (id: number, action: 'approve' | 'reject') => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/enrollment-requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });

      if (res.ok) {
        setRequests((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error('Failed to update request:', error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all group"
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`p-4 rounded-2xl bg-${card.color}-50 text-${card.color}-600 group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className="w-8 h-8" />
              </div>
              <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-[10px] font-bold text-green-600">{card.trend}</span>
              </div>
            </div>
            <p className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-1">{card.label}</p>
            <h3 className="text-4xl font-black text-gray-900">{loading ? '...' : card.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900">Recent Platform Activity</h3>
            <button className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all">View Log</button>
          </div>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 group cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">New enrollment in "Full Stack Mastery"</p>
                  <p className="text-xs text-gray-400 font-medium">By Emran Hashmi • 24 minutes ago</p>
                </div>
                <div className="w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions or Analytics Mock */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-600/30">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2">Weekly Summary</h3>
            <p className="text-blue-100 text-sm mb-8">Your platform performance is up by 15% this week.</p>
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span>Revenue Target</span>
                  <span>75%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-3/4 rounded-full" />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span>New Student Acquisition</span>
                  <span>92%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[92%] rounded-full" />
                </div>
              </div>
            </div>
            <button className="mt-8 w-full py-4 bg-white text-blue-600 rounded-2xl font-bold hover:bg-blue-50 transition-all shadow-xl">
              Download Report
            </button>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        </div>
      </div>

      <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Pending Enrollment Requests</h3>
          <div className="flex items-center gap-4">
            <Link href="/admin/students" className="text-sm font-bold text-blue-600 hover:underline">
              View enrolled students
            </Link>
            <span className="text-sm font-bold text-gray-500">{requests.length} pending</span>
          </div>
        </div>

        {requests.length === 0 ? (
          <p className="text-gray-500 text-sm">No pending payment approval requests right now.</p>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-2xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors text-left"
                    >
                      {request.first_name} {request.last_name}
                    </button>
                    <p className="text-xs text-gray-500 mt-1">
                      {request.course_title} | {request.payment_method.toUpperCase()} | {request.email}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Txn: {request.transaction_id || 'N/A'} | {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => updateRequest(request.id, 'approve')}
                      disabled={actionLoading}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateRequest(request.id, 'reject')}
                      disabled={actionLoading}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enrollment Request Details Modal */}
      {selectedRequest && (
        <EnrollmentRequestDetails
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onUpdate={updateRequest}
          loading={actionLoading}
        />
      )}
    </div>
  );
}