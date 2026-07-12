"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, AlertCircle, CheckCircle, ArrowRight, Eye, EyeOff, GraduationCap } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [otp, setOtp] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Clear states when typing
  useEffect(() => {
    if (error) setError('');
  }, [email, otp, newPassword, confirmPassword]);

  // Request OTP Submission
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(data.message || 'OTP sent successfully! Check your email inbox.');
        setStep(2);
      } else {
        setError(data.error || 'Failed to send OTP. Please check your email.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // OTP Input character handling
  const handleOtpChange = (value: string, index: number) => {
    const cleanVal = value.replace(/\D/g, '');
    const char = cleanVal.slice(-1);
    
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);
    const updatedOtp = newDigits.join('');
    setOtp(updatedOtp);

    // Move to next input box
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // OTP Backspace key handling
  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        // Focus previous input and clear it
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...otpDigits];
        newDigits[index - 1] = '';
        setOtpDigits(newDigits);
        setOtp(newDigits.join(''));
      }
    }
  };

  // OTP Copy-Paste handling
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newDigits = [...otpDigits];
    
    for (let i = 0; i < text.length; i++) {
      newDigits[i] = text[i];
    }
    setOtpDigits(newDigits);
    setOtp(newDigits.join(''));

    // Focus last or next input slot
    const focusIdx = Math.min(text.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  // Step 2: Verify OTP Only Submission
  const handleVerifyOtpOnly = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('OTP verified successfully! Please enter your new password below.');
        setStep(3);
      } else {
        setError(data.error || 'Invalid OTP code.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password Submission
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(data.message || 'Password reset successfully! Redirecting...');
        toast.success('Password updated successfully! 🎉');
        
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.error || 'Password reset failed.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-160px)] pt-24 pb-12 px-4 flex items-center justify-center relative overflow-hidden bg-slate-50 text-slate-900 dark:bg-gradient-to-br dark:from-[#030014] dark:via-[#05051a] dark:to-[#09092d] dark:text-white font-sans">
      <ToastContainer position="top-right" theme="dark" />

      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none dark:block hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Recover Card */}
      <div className="relative z-10 w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-8 space-y-6 dark:bg-white/5 dark:border-white/10 dark:shadow-2xl">
        
        <div className="text-left">
          <Link 
            href="/login" 
            className="text-[10px] text-blue-600 hover:text-blue-500 font-bold uppercase tracking-wider transition-colors"
          >
            &larr; Return to Sign In
          </Link>
        </div>

        <div className="text-center space-y-2">
          <div className="mx-auto relative w-12 h-12 flex items-center justify-center bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {step === 1 ? 'Recover Password' : step === 2 ? 'Verify OTP' : 'Set New Password'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
            {step === 1 
              ? 'Enter your registered email address to receive a secure OTP code.' 
              : step === 2
              ? 'Enter the 6-digit OTP code sent to your email.'
              : 'Choose a strong new password for your account.'
            }
          </p>
        </div>

        {/* Alert Errors */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl flex items-center gap-3 text-xs"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Alert Success */}
        <AnimatePresence mode="wait">
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-650 px-4 py-2.5 rounded-xl flex items-start gap-3 text-xs"
            >
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Forms */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            /* STEP 1: Email Form */
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl placeholder-slate-450 text-slate-900 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all text-sm h-11 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-slate-600"
                      placeholder="name@example.com"
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg hover:shadow-blue-500/25 duration-300 flex items-center justify-center gap-2 group cursor-pointer active:scale-[0.99]"
                >
                  {loading ? 'Sending...' : 'Send OTP Code'}
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            /* STEP 2: OTP Form */
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleVerifyOtpOnly} className="space-y-6">
                
                {/* Premium 6-Box OTP Input */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 text-center mb-4">
                    Enter 6-Digit OTP Code
                  </label>
                  <div className="flex justify-center gap-3 mx-auto">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        type="text"
                        maxLength={1}
                        ref={(el) => {
                          inputRefs.current[idx] = el;
                        }}
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, idx)}
                        onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                        onPaste={idx === 0 ? handleOtpPaste : undefined}
                        className="w-11 h-11 text-center bg-slate-100 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-slate-900 text-lg font-bold outline-none transition-all dark:bg-white/5 dark:border-white/10 dark:text-white"
                        disabled={loading}
                        placeholder="-"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg hover:shadow-blue-500/25 duration-300 flex items-center justify-center gap-2 group cursor-pointer active:scale-[0.99] mt-6"
                >
                  {loading ? 'Verifying...' : 'Verify OTP Code'}
                </button>
              </form>
            </motion.div>
          )}

          {step === 3 && (
            /* STEP 3: Password Form */
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleResetPassword} className="space-y-5">
                
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                    New Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3 bg-slate-100 border border-slate-200 rounded-xl placeholder-slate-450 text-slate-900 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all text-sm h-11 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-slate-600"
                      placeholder="••••••••"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-350 focus:outline-none cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3 bg-slate-100 border border-slate-200 rounded-xl placeholder-slate-450 text-slate-900 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all text-sm h-11 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-slate-600"
                      placeholder="••••••••"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 focus:outline-none cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg hover:shadow-blue-500/25 duration-300 flex items-center justify-center gap-2 group cursor-pointer active:scale-[0.99] mt-6"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
