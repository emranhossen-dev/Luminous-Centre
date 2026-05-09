"use client";

import React, { useState } from 'react';
import { X, Check, XCircle, User, Mail, Phone, Calendar, CreditCard, BookOpen } from 'lucide-react';

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

interface EnrollmentRequestDetailsProps {
  request: EnrollmentRequest;
  onClose: () => void;
  onUpdate: (id: number, action: 'approve' | 'reject') => void;
  loading?: boolean;
}

export default function EnrollmentRequestDetails({ 
  request, 
  onClose, 
  onUpdate,
  loading = false 
}: EnrollmentRequestDetailsProps) {
  const handleAction = async (action: 'approve' | 'reject') => {
    await onUpdate(request.id, action);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[32px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Enrollment Request Details</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Student Information */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 flex items-center gap-2">
              <User size={18} className="text-blue-600" />
              Student Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-2xl p-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Full Name</p>
                <p className="font-semibold text-gray-900">{request.first_name} {request.last_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Email</p>
                <p className="font-semibold text-gray-900 flex items-center gap-1">
                  <Mail size={14} className="text-gray-400" />
                  {request.email}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Phone</p>
                <p className="font-semibold text-gray-900 flex items-center gap-1">
                  <Phone size={14} className="text-gray-400" />
                  {request.phone || 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Request Date</p>
                <p className="font-semibold text-gray-900 flex items-center gap-1">
                  <Calendar size={14} className="text-gray-400" />
                  {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Course Information */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 flex items-center gap-2">
              <BookOpen size={18} className="text-blue-600" />
              Course Information
            </h4>
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="font-semibold text-gray-900 text-lg">{request.course_title}</p>
            </div>
          </div>

          {/* Payment Information */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 flex items-center gap-2">
              <CreditCard size={18} className="text-blue-600" />
              Payment Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-2xl p-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Payment Method</p>
                <p className="font-semibold text-gray-900 capitalize">{request.payment_method}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Amount</p>
                <p className="font-semibold text-gray-900">
                  {request.currency === 'BDT' ? '৳' : request.currency} {request.amount}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Transaction ID</p>
                <p className="font-semibold text-gray-900">{request.transaction_id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Payment Status</p>
                <p className="font-semibold text-gray-900 capitalize">{request.payment_status}</p>
              </div>
              {request.payer_name && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Payer Name</p>
                  <p className="font-semibold text-gray-900">{request.payer_name}</p>
                </div>
              )}
              {request.payer_mobile && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Payer Mobile</p>
                  <p className="font-semibold text-gray-900">{request.payer_mobile}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => handleAction('approve')}
              disabled={loading}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Check size={18} />
              {loading ? 'Processing...' : 'Approve Request'}
            </button>
            <button
              onClick={() => handleAction('reject')}
              disabled={loading}
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              <XCircle size={18} />
              {loading ? 'Processing...' : 'Reject Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
