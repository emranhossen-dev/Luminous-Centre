'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  User, Phone, Mail, CreditCard, Upload, 
  Send, CheckCircle, X, AlertCircle, Loader2,
  Smartphone, Briefcase, Landmark
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Course {
  id: string | number;
  title: string;
  slug: string;
  current_price: number;
  regular_price: number;
  currency?: string;
  batch_name?: string;
  category?: string;
}

interface EnrollModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
}

type PaymentMethodType = 'bkash_auto' | 'manual' | 'cash';

export default function EnrollModal({ course, isOpen, onClose }: EnrollModalProps) {
  const router = useRouter();
  const { user, token, openModal } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('bkash_auto');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Prefill details if user is logged in
  useEffect(() => {
    if (isOpen) {
      if (user) {
        setFullName(`${user.firstName || ''} ${user.lastName || ''}`.trim());
        setEmail(user.email || '');
      } else {
        setFullName('');
        setEmail('');
      }
      setMobileNumber('');
      setTransactionId('');
      setPaymentScreenshot(null);
      setPreviewUrl('');
      setMessage('');
      setErrorMsg('');
      setIsSubmitted(false);
    }
  }, [isOpen, user]);

  const amountText = useMemo(() => {
    return `${course.current_price} ${course.currency || 'BDT'}`;
  }, [course]);

  const handleImageUpload = (file: File) => {
    setPaymentScreenshot(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const uploadToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', '2378a037ba7373b59817b5ac4d744773');

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    if (data.success) {
      return data.data.url;
    }
    throw new Error('Failed to upload image');
  };

  // Trigger automated bKash checkout
  const handleBkashAutoCheckout = async () => {
    if (!token) {
      setErrorMsg('You must be logged in to proceed with bKash checkout.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setMessage('Initiating bKash payment gateway...');

    try {
      const response = await fetch('/api/student/payment/bkash/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ courseId: Number(course.id) })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not start bKash payment process');
      }
      if (data.bkashURL) {
        window.location.href = data.bkashURL;
        return;
      }
      throw new Error('No checkout URL returned from bKash');
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to start bKash payment');
      setSubmitting(false);
    }
  };

  // Submit manual/cash enrollment
  const handleSubmitEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setErrorMsg('');

    try {
      let imageUrl = '';
      if (paymentScreenshot) {
        try {
          imageUrl = await uploadToImgBB(paymentScreenshot);
        } catch (uploadError) {
          throw new Error('Failed to upload payment screenshot');
        }
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const requestBody = {
        courseId: Number(course.id),
        fullName,
        mobileNumber,
        email,
        transactionId: paymentMethod === 'cash' ? 'CASH' : transactionId,
        paymentScreenshotUrl: imageUrl,
        amount: course.current_price,
        courseTitle: course.title,
        courseCategory: course.category || 'offline',
        coursePrice: course.current_price,
        batchName: course.batch_name || 'Current Batch',
        paymentMethod: paymentMethod === 'cash' ? 'cash' : 'manual'
      };

      const response = await fetch('/api/enhanced-enrollment/course', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Enrollment submission failed');
      }

      setIsSubmitted(true);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to submit enrollment request');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
        />

        {/* Modal card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-2xl bg-slate-900/95 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Top Banner Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-2xl transition cursor-pointer z-20"
          >
            <X size={18} />
          </button>

          {isSubmitted ? (
            /* SUCCESS VIEW */
            <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center my-auto min-h-[400px]">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
                className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/25"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>
              
              <h2 className="text-3xl font-black text-white tracking-tight mb-3">Application Received!</h2>
              <p className="text-slate-300 max-w-md leading-relaxed text-sm">
                {paymentMethod === 'cash' 
                  ? 'Your enrollment request has been submitted. Please complete your cash payment at the training center office to activate your course access.'
                  : 'Your manual enrollment request has been submitted. We are currently verifying your transaction ID. You will be notified once approved.'
                }
              </p>

              <button 
                onClick={onClose}
                className="mt-8 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold text-sm transition-all hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 cursor-pointer"
              >
                Close Window
              </button>
            </div>
          ) : (
            /* FORM VIEW */
            <>
              {/* Header */}
              <div className="px-8 pt-8 pb-4 shrink-0">
                <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1 rounded-full font-black uppercase tracking-widest inline-block mb-3">
                  Course Enrollment
                </span>
                <h3 className="text-2xl font-black text-white tracking-tight max-w-[90%] leading-tight">
                  Enroll in <span className="text-blue-400">{course.title}</span>
                </h3>
                <div className="flex gap-2 items-baseline mt-2">
                  <span className="text-xs text-slate-400 font-bold">Fee:</span>
                  <span className="text-base font-extrabold text-slate-100">{amountText}</span>
                  {course.regular_price > course.current_price && (
                    <span className="text-xs text-slate-500 line-through font-bold">
                      {course.regular_price} {course.currency || 'BDT'}
                    </span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="px-8 pb-8 overflow-y-auto flex-1 space-y-6 custom-scrollbar pr-6 mr-2">
                
                {/* 1. Payment Method Tabs */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Payment Method</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {/* bKash Auto */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bkash_auto')}
                      className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        paymentMethod === 'bkash_auto'
                          ? 'bg-pink-600/10 border-pink-500/40 text-pink-400'
                          : 'bg-white/5 border-white/5 hover:border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <Smartphone className={`w-5 h-5 ${paymentMethod === 'bkash_auto' ? 'text-pink-400' : 'text-slate-400'}`} />
                      <div className="leading-tight">
                        <p className="text-xs font-extrabold">bKash Checkout</p>
                        <p className="text-[9px] opacity-75 mt-0.5">Automated Gateway</p>
                      </div>
                    </button>

                    {/* Manual bKash */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('manual')}
                      className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        paymentMethod === 'manual'
                          ? 'bg-blue-600/10 border-blue-500/40 text-blue-400'
                          : 'bg-white/5 border-white/5 hover:border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <Landmark className={`w-5 h-5 ${paymentMethod === 'manual' ? 'text-blue-400' : 'text-slate-400'}`} />
                      <div className="leading-tight">
                        <p className="text-xs font-extrabold">Send Money</p>
                        <p className="text-[9px] opacity-75 mt-0.5">Manual bKash/Nagad</p>
                      </div>
                    </button>

                    {/* Cash */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        paymentMethod === 'cash'
                          ? 'bg-emerald-600/10 border-emerald-500/40 text-emerald-400'
                          : 'bg-white/5 border-white/5 hover:border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <Briefcase className={`w-5 h-5 ${paymentMethod === 'cash' ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <div className="leading-tight">
                        <p className="text-xs font-extrabold">Office Cash</p>
                        <p className="text-[9px] opacity-75 mt-0.5">Pay at Training Center</p>
                      </div>
                    </button>

                  </div>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

                {/* Progress message */}
                {message && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-3 text-blue-400 text-xs font-bold">
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>{message}</span>
                  </div>
                )}

                {/* Conditional Content by Mode */}
                {paymentMethod === 'bkash_auto' ? (
                  /* BKASH AUTOMATED VIEW */
                  <div className="space-y-5 bg-white/5 border border-white/5 rounded-3xl p-6">
                    <h4 className="font-extrabold text-white text-sm">Automated bKash Checkout</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      You will be securely redirected to the official bKash checkout page to complete your transaction. Your enrollment will activate automatically upon successful payment.
                    </p>

                    {token ? (
                      <button
                        onClick={handleBkashAutoCheckout}
                        disabled={submitting}
                        className="w-full py-4 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl transition shadow-lg hover:shadow-pink-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-5.5 h-5.5 animate-spin" /> Redirecting...
                          </>
                        ) : (
                          <>
                            Proceed to bKash Checkout
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="space-y-4 pt-2">
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-2xl text-xs leading-relaxed">
                          * Authentication required. You must login or register to your Luminous account to use automated bKash checkouts.
                        </div>
                        <button
                          onClick={() => {
                            onClose();
                            openModal('login');
                          }}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                        >
                          Login to Account
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* MANUAL / CASH FORMS */
                  <form onSubmit={handleSubmitEnrollment} className="space-y-5">
                    
                    {paymentMethod === 'manual' ? (
                      /* MANUAL PAYMENT INSTRUCTIONS */
                      <div className="bg-blue-600/10 border border-blue-500/20 rounded-3xl p-5 space-y-3">
                        <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Payment Instructions</h4>
                        <p className="text-xs text-slate-200 leading-relaxed">
                          Bkash app থেকে Send Money অথবা Cash Out করে <strong className="text-white">01577296272</strong> (Personal) নম্বরে <strong className="text-white">{amountText}</strong> টাকা পাঠিয়ে নিচে Transaction ID ও পেমেন্ট বিবরণ দিন।
                        </p>
                      </div>
                    ) : (
                      /* CASH PAYMENT INSTRUCTIONS */
                      <div className="bg-emerald-600/10 border border-emerald-500/20 rounded-3xl p-5 space-y-3">
                        <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Office Payment Instructions</h4>
                        <p className="text-xs text-slate-200 leading-relaxed">
                          Luminous Skill Development Training Center অফিসে এসে সরাসরি ক্যাশ প্রদান করতে পারবেন। নিচে আপনার ফর্মটি সাবমিট করুন। আপনার পেমেন্ট অফিসে রিসিভ হওয়ার পর কোর্সটি সচল করা হবে।
                        </p>
                      </div>
                    )}

                    {/* Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Name */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                          <User size={13} /> Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          placeholder="Your full name"
                          className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                        />
                      </div>

                      {/* Phone */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                          <Phone size={13} /> Mobile Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={mobileNumber}
                          onChange={e => setMobileNumber(e.target.value)}
                          placeholder="01XXXXXXXXX"
                          className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                        />
                      </div>

                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                        <Mail size={13} /> Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>

                    {paymentMethod === 'manual' && (
                      <>
                        {/* Transaction ID */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                            <CreditCard size={13} /> Transaction ID *
                          </label>
                          <input
                            type="text"
                            required={paymentMethod === 'manual'}
                            value={transactionId}
                            onChange={e => setTransactionId(e.target.value)}
                            placeholder="bKash/Nagad transaction hash"
                            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                          />
                        </div>

                        {/* Screenshot Upload */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                            <Upload size={13} /> Payment Screenshot (Optional)
                          </label>
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                              className="hidden"
                              id="modal-payment-screenshot"
                            />
                            <label
                              htmlFor="modal-payment-screenshot"
                              className="flex flex-col items-center justify-center w-full px-4 py-6 bg-slate-950/40 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:bg-slate-950/70 transition"
                            >
                              {previewUrl ? (
                                <div className="text-center">
                                  <img src={previewUrl} alt="Payment preview" className="max-h-24 mx-auto mb-2 rounded-lg" />
                                  <p className="text-xs text-green-400 font-bold">Image loaded successfully</p>
                                </div>
                              ) : (
                                <div className="text-center text-slate-500">
                                  <Upload className="w-6 h-6 mx-auto mb-1 text-slate-600" />
                                  <p className="text-xs font-medium">Click to select screenshot</p>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`w-full py-4 mt-2 bg-gradient-to-r ${
                        paymentMethod === 'cash' 
                          ? 'from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 hover:shadow-emerald-500/10'
                          : 'from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 hover:shadow-blue-500/10'
                      } text-white font-extrabold text-sm rounded-2xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98`}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-5.5 h-5.5 animate-spin" /> Submitting Request...
                        </>
                      ) : (
                        <>
                          <Send size={15} /> Confirm Enrollment
                        </>
                      )}
                    </button>

                  </form>
                )}

              </div>
            </>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
