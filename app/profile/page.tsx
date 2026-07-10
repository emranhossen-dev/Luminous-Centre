"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Mail, Shield, AlertCircle, CheckCircle, RefreshCcw, KeyRound } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ProfilePage() {
  const { user, token } = useAuth();
  const router = useRouter();

  // Change Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changeLoading, setChangeLoading] = useState(false);
  const [changeError, setChangeError] = useState('');
  const [changeSuccess, setChangeSuccess] = useState('');

  // Forgot Password (OTP) States
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpPassword, setOtpPassword] = useState('');
  const [otpConfirmPassword, setOtpConfirmPassword] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    // Only check if it's client side and auth is fully loaded
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      router.push('/login');
    }
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#05060f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeLoading(true);
    setChangeError('');
    setChangeSuccess('');

    if (newPassword !== confirmNewPassword) {
      setChangeError('New passwords do not match');
      setChangeLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setChangeError('New password must be at least 6 characters long');
      setChangeLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setChangeSuccess('Password updated successfully! 🎉');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        toast.success('Password updated successfully!');
      } else {
        setChangeError(data.error || 'Failed to update password');
        toast.error(data.error || 'Failed to update password');
      }
    } catch (err) {
      setChangeError('Network error. Please try again.');
      toast.error('Network error. Please try again.');
    } finally {
      setChangeLoading(false);
    }
  };

  // Trigger OTP Send
  const handleSendOTP = async () => {
    setOtpLoading(true);
    setOtpError('');
    setOtpSuccess('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpSent(true);
        setOtpSuccess('OTP code has been sent to your email address! 📧');
        toast.success('OTP code sent successfully!');
      } else {
        setOtpError(data.error || 'Failed to send OTP code');
        toast.error(data.error || 'Failed to send OTP code');
      }
    } catch (err) {
      setOtpError('Network error. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle Verify OTP and Reset
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError('');
    setOtpSuccess('');

    if (otpPassword !== otpConfirmPassword) {
      setOtpError('Passwords do not match');
      setOtpLoading(false);
      return;
    }

    if (otpPassword.length < 6) {
      setOtpError('Password must be at least 6 characters long');
      setOtpLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          otp: otpCode,
          newPassword: otpPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpSuccess('Password reset successfully! You can use your new password next time you login. 🌟');
        setOtpCode('');
        setOtpPassword('');
        setOtpConfirmPassword('');
        setOtpSent(false);
        toast.success('Password reset successfully!');
      } else {
        setOtpError(data.error || 'Failed to verify OTP code');
        toast.error(data.error || 'Failed to verify OTP code');
      }
    } catch (err) {
      setOtpError('Network error. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'mentor': return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'employee': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      default: return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#070814] text-white pt-24 pb-16 px-4 md:px-8 relative overflow-hidden font-sans">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-400 text-sm">
            Manage your Luminous Skills account information and security choices.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: User Profile Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 backdrop-blur-xl shadow-xl flex flex-col items-center text-center">
              
              {/* Profile Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-500/30 flex items-center justify-center text-white font-extrabold text-3xl mb-4 shadow-lg shadow-blue-500/10">
                {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>

              <h2 className="text-xl font-bold text-white mb-1">
                {user.firstName} {user.lastName}
              </h2>
              
              <div className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border mb-6 ${getRoleColor(user.roleName)}`}>
                {user.roleName?.toUpperCase()}
              </div>

              {/* Detail Items */}
              <div className="w-full space-y-4 border-t border-white/5 pt-6 text-left">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Email Address</p>
                    <p className="text-sm font-medium text-white break-all">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Security Level</p>
                    <p className="text-sm font-medium text-white">
                      {user.roleName === 'admin' ? 'Superuser Access' : 'Authorized Staff'}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT: Security Actions Form Grid */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Action 1: Change Password Form */}
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <KeyRound className="w-6 h-6 text-blue-500" />
                <h3 className="text-xl font-bold text-white">Change Password</h3>
              </div>

              {changeError && (
                <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-rose-400 text-sm mb-6">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{changeError}</span>
                </div>
              )}

              {changeSuccess && (
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-emerald-400 text-sm mb-6">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <span>{changeSuccess}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm text-white transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm text-white transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm text-white transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={changeLoading}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-md active:scale-95 duration-200 mt-4 cursor-pointer"
                >
                  {changeLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>

            {/* Action 2: Password Reset Via OTP Form */}
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <RefreshCcw className="w-6 h-6 text-indigo-500" />
                <h3 className="text-xl font-bold text-white">Password Recovery (OTP)</h3>
              </div>

              {otpError && (
                <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-rose-400 text-sm mb-6">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              {otpSuccess && (
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-emerald-400 text-sm mb-6">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <span>{otpSuccess}</span>
                </div>
              )}

              <AnimatePresence mode="wait">
                {!otpSent ? (
                  <motion.div
                    key="send-otp"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <p className="text-sm text-gray-400 leading-relaxed">
                      If you have forgotten your password or want to verify password reset access via email OTP, trigger a secure one-time verification code code to: <strong className="text-white">{user.email}</strong>.
                    </p>
                    <button
                      onClick={handleSendOTP}
                      disabled={otpLoading}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-md active:scale-95 duration-200 mt-2 cursor-pointer"
                    >
                      {otpLoading ? 'Sending OTP...' : 'Send Reset OTP'}
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="verify-otp"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleVerifyOTP}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* OTP Input */}
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                          6-Digit OTP Code
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm text-white tracking-widest text-center font-bold text-lg transition-all"
                          placeholder="000000"
                        />
                      </div>

                      {/* New Password */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                          New Password
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input
                            type="password"
                            required
                            value={otpPassword}
                            onChange={(e) => setOtpPassword(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm text-white transition-all"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>

                      {/* Confirm New Password */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input
                            type="password"
                            required
                            value={otpConfirmPassword}
                            onChange={(e) => setOtpConfirmPassword(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm text-white transition-all"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>

                    </div>

                    <div className="flex gap-3 mt-4">
                      <button
                        type="submit"
                        disabled={otpLoading}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-md active:scale-95 duration-200 cursor-pointer"
                      >
                        {otpLoading ? 'Verifying...' : 'Verify & Reset Password'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtpError('');
                          setOtpSuccess('');
                        }}
                        className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-semibold rounded-xl transition-all border border-white/5 active:scale-95 duration-200 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
