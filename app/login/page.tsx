"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleOAuth } from '@/lib/google-oauth';
import { Mail, Lock, ArrowRight, LogIn, Eye, EyeOff, User, Phone, AlertCircle } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function LoginPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Determine active tab from URL query params (default to 'login')
  const tabParam = searchParams.get('tab');
  const [isLogin, setIsLogin] = useState(tabParam !== 'signup');

  // Sign In States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign Up States
  const [signUpData, setSignUpData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'student'
  });
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // Clear errors when toggling tabs or typing
  useEffect(() => {
    setError('');
  }, [isLogin, email, password, signUpData]);

  // Sync tab with query params if changed externally
  useEffect(() => {
    setIsLogin(tabParam !== 'signup');
  }, [tabParam]);

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    setError('');

    const redirect = searchParams.get('redirect');
    const course = searchParams.get('course');

    if (redirect) sessionStorage.setItem('auth_redirect', redirect);
    if (course) sessionStorage.setItem('auth_course', course);

    try {
      GoogleOAuth.signInWithRedirect();
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
      setIsGoogleLoading(false);
    }
  };

  // Handle Login Submission
  const handleLoginSubmit = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        if (data.user.roleName !== 'student') {
          localStorage.setItem('adminToken', data.token);
          localStorage.setItem('adminUser', JSON.stringify(data.user));
        }

        const redirect = searchParams.get('redirect');
        const course = searchParams.get('course');

        if (redirect === 'enroll') {
          router.push('/courses');
          return;
        } else if (redirect === 'course' && course) {
          router.push(`/courses/${course}`);
          return;
        }

        // Redirect based on role
        switch (data.user.roleName) {
          case 'admin':
          case 'manager':
          case 'employee':
            router.push('/admin/dashboard');
            break;
          case 'mentor':
            router.push('/mentor');
            break;
          case 'student':
            router.push('/student');
            break;
          default:
            router.push('/');
            break;
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Up Submission
  const handleSignUpSubmit = async () => {
    if (!signUpData.firstName || !signUpData.lastName || !signUpData.email || !signUpData.password) {
      setError('Required fields are missing.');
      return;
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: signUpData.firstName,
          lastName: signUpData.lastName,
          email: signUpData.email,
          password: signUpData.password,
          phone: signUpData.phone,
          role: 'student' // Force role to student for public registration
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Account created successfully! 🎉');

        setTimeout(() => {
          switch (data.user.roleName) {
            case 'admin': router.push('/admin'); break;
            case 'employee': router.push('/employee'); break;
            case 'mentor': router.push('/mentor'); break;
            case 'student': router.push('/student'); break;
            default: router.push('/'); break;
          }
        }, 1500);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSignUpData(prev => ({ ...prev, [name]: value }));
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail("");
    setPassword("");
    setSignUpData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      role: 'student'
    });
    setShowPassword(false);
    setShowSignUpPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="w-full min-h-[calc(100vh-160px)] pt-24 pb-12 px-4 flex items-center justify-center relative overflow-hidden bg-slate-50 text-slate-900 dark:bg-gradient-to-br dark:from-[#030014] dark:via-[#05051a] dark:to-[#09092d] dark:text-white font-sans">
      <ToastContainer position="top-right" theme="dark" />

      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 dark:block hidden">
        <div
          className="absolute top-[10%] left-[10%] w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute top-[30%] right-[15%] w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] animate-pulse"
          style={{ animationDuration: "10s", animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-[20%] left-[30%] w-72 h-72 bg-indigo-600/10 rounded-full blur-[90px] animate-pulse"
          style={{ animationDuration: "12s", animationDelay: "4s" }}
        />
      </div>

      {/* Main Content Area */}
      <div className="relative z-20 flex-1 flex items-center justify-center w-full max-w-5xl mx-auto">
        
        {/* Desktop sliding overlay container */}
        <div className="hidden lg:flex w-full max-w-5xl h-[560px] relative bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden dark:bg-white/5 dark:border-white/10 dark:shadow-2xl dark:backdrop-blur-xl">
          
          {/* Sign In panel (left half on login mode) */}
          <div
            className={`absolute left-0 top-0 w-1/2 h-full flex items-center justify-center p-10 transition-all duration-700 ease-in-out ${
              isLogin
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-full pointer-events-none"
            }`}
          >
            <div className="w-full max-w-sm space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Sign In
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Enter your credentials to continue
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-450 dark:text-red-400 px-4 py-2.5 rounded-xl flex items-center gap-3 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors dark:text-slate-500 dark:group-focus-within:text-blue-400" />
                    <input
                      type="email"
                      placeholder="Email address"
                      className="w-full pl-11 pr-4 py-3 bg-slate-100 border border-slate-200 text-slate-900 rounded-xl placeholder-slate-450 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all text-sm h-11 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-slate-600"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLoginSubmit()}
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors dark:text-slate-500 dark:group-focus-within:text-blue-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className="w-full pl-11 pr-10 py-3 bg-slate-100 border border-slate-200 text-slate-900 rounded-xl placeholder-slate-450 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all text-sm h-11 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-slate-600"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLoginSubmit()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-700 transition-colors focus:outline-none cursor-pointer dark:hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <Link href="/login/forget" className="text-xs font-bold text-blue-600 hover:text-blue-500 transition-colors dark:text-blue-500 dark:hover:text-blue-400">
                    Forgot Password?
                  </Link>
                </div>

                <button
                  onClick={handleLoginSubmit}
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-500/25 h-11 font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Signing in..." : "Sign In"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200 dark:border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-[#0c0d21] px-3 text-slate-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl h-11 transition-all cursor-pointer disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <LogIn className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" />
                Google Account
              </button>
            </div>
          </div>

          {/* Sign Up panel (right half on register mode) */}
          <div
            className={`absolute left-1/2 top-0 w-1/2 h-full flex items-center justify-center p-10 transition-all duration-700 ease-in-out ${
              !isLogin
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-full pointer-events-none"
            }`}
          >
            <div className="w-full max-w-sm space-y-5">
              <div className="text-center space-y-1">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Create Account
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Join Luminous LMS Portal today
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-450 dark:text-red-400 px-4 py-2 rounded-xl flex items-center gap-3 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-3.5">
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative group">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 dark:text-slate-500" />
                      <input
                        name="firstName"
                        type="text"
                        placeholder="First name"
                        className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 text-slate-900 rounded-xl placeholder-slate-450 focus:outline-none focus:border-blue-500/50 text-xs h-10 transition-all dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-slate-600"
                        value={signUpData.firstName}
                        onChange={handleSignUpChange}
                      />
                    </div>
                    <div className="relative group">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 dark:text-slate-500" />
                      <input
                        name="lastName"
                        type="text"
                        placeholder="Last name"
                        className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 text-slate-900 rounded-xl placeholder-slate-450 focus:outline-none focus:border-blue-500/50 text-xs h-10 transition-all dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-slate-600"
                        value={signUpData.lastName}
                        onChange={handleSignUpChange}
                      />
                    </div>
                  </div>

                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 dark:text-slate-500" />
                    <input
                      name="email"
                      type="email"
                      placeholder="Email address"
                      className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 text-slate-900 rounded-xl placeholder-slate-450 focus:outline-none focus:border-blue-500/50 text-xs h-10 transition-all dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-slate-600"
                      value={signUpData.email}
                      onChange={handleSignUpChange}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative group">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 dark:text-slate-500" />
                      <input
                        name="password"
                        type={showSignUpPassword ? "text" : "password"}
                        placeholder="Password"
                        className="w-full pl-9 pr-8 py-2 bg-slate-100 border border-slate-200 text-slate-900 rounded-xl placeholder-slate-450 focus:outline-none focus:border-blue-500/50 text-xs h-10 transition-all dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-slate-600"
                        value={signUpData.password}
                        onChange={handleSignUpChange}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        className="absolute right-2 top-2.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 focus:outline-none"
                      >
                        {showSignUpPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 dark:text-slate-500" />
                      <input
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm"
                        className="w-full pl-9 pr-8 py-2 bg-slate-100 border border-slate-200 text-slate-900 rounded-xl placeholder-slate-450 focus:outline-none focus:border-blue-500/50 text-xs h-10 transition-all dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-slate-600"
                        value={signUpData.confirmPassword}
                        onChange={handleSignUpChange}
                        onKeyDown={(e) => e.key === 'Enter' && handleSignUpSubmit()}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 top-2.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 focus:outline-none"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="relative group">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 dark:text-slate-500" />
                    <input
                      name="phone"
                      type="tel"
                      placeholder="Phone number (Optional)"
                      className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 text-slate-900 rounded-xl placeholder-slate-450 focus:outline-none focus:border-blue-500/50 text-xs h-10 transition-all dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-slate-600"
                      value={signUpData.phone}
                      onChange={handleSignUpChange}
                    />
                  </div>
                </div>

                <button
                  onClick={handleSignUpSubmit}
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-500/25 h-10 text-xs font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Creating account..." : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200 dark:border-white/10" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white dark:bg-[#0c0d21] px-3 text-slate-550 dark:text-slate-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl h-10 text-xs transition-all cursor-pointer disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <LogIn className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" />
                Google Account
              </button>
            </div>
          </div>

          {/* Sliding Overlay Container */}
          <div
            className={`absolute top-0 h-full w-1/2 bg-gradient-to-br from-blue-600 to-indigo-600 transition-all duration-700 ease-in-out flex flex-col items-center justify-center text-white p-10 ${
              isLogin
                ? "left-1/2 rounded-l-[60px]"
                : "left-0 rounded-r-[60px]"
            }`}
          >
            <div className="text-center space-y-5 max-w-xs">
              {isLogin ? (
                <>
                  <h2 className="text-3xl font-bold tracking-tight text-white">New to Luminous?</h2>
                  <p className="text-blue-100 text-sm leading-relaxed">
                    Create an account with your personal details to access courses, quizzes, and live recordings
                  </p>
                  <button
                    onClick={toggleMode}
                    className="px-8 py-2.5 rounded-full border-2 border-white/40 text-white font-bold text-xs hover:bg-white/10 transition-all cursor-pointer active:scale-95"
                  >
                    SIGN UP
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold tracking-tight text-white">Already Registered?</h2>
                  <p className="text-blue-100 text-sm leading-relaxed">
                    Log in with your existing credentials to access your LMS dashboard
                  </p>
                  <button
                    onClick={toggleMode}
                    className="px-8 py-2.5 rounded-full border-2 border-white/40 text-white font-bold text-xs hover:bg-white/10 transition-all cursor-pointer active:scale-95"
                  >
                    SIGN IN
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Form Layout (single panel stacked card) */}
        <div className="lg:hidden w-full max-w-md mx-auto">
          
          {/* Mobile branding header */}
          <div className="text-center mb-6 space-y-2">
            <div className="mx-auto relative w-14 h-14">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl blur opacity-60" />
              <img
                src="/logo.jpg"
                alt="Luminous Logo"
                className="relative rounded-2xl w-14 h-14 object-cover animate-pulse"
              />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {isLogin ? "Welcome Back" : "Get Started"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              {isLogin
                ? "Sign in to access your dashboard"
                : "Create your student account today"}
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-5 sm:p-8 rounded-3xl space-y-5 shadow-xl dark:bg-white/5 dark:border-white/10 dark:shadow-2xl dark:backdrop-blur-xl">
            <div className="space-y-1.5 text-center">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {isLogin ? "Sign In" : "Create Account"}
              </h3>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-450 dark:text-red-400 px-4 py-2 rounded-xl flex items-center gap-3 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {isLogin ? (
                /* Mobile Login Inputs */
                <div className="space-y-3">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 dark:text-slate-500" />
                    <input
                      type="email"
                      placeholder="Email address"
                      className="w-full pl-11 pr-4 py-3 bg-slate-100 border border-slate-200 text-slate-900 rounded-xl placeholder-slate-450 focus:outline-none focus:border-blue-500/50 text-sm h-11 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-slate-600"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 dark:text-slate-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className="w-full pl-11 pr-10 py-3 bg-slate-100 border border-slate-200 text-slate-900 rounded-xl placeholder-slate-450 focus:outline-none focus:border-blue-500/50 text-sm h-11 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-slate-600"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLoginSubmit()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-550 hover:text-slate-700 dark:text-slate-500 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="text-right">
                    <Link href="/login/forget" className="text-xs font-bold text-blue-600 hover:text-blue-500 transition-colors dark:text-blue-500 dark:hover:text-blue-400">
                      Forgot Password?
                    </Link>
                  </div>
                </div>
              ) : (
                /* Mobile Register Inputs */
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative group">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                      <input
                        name="firstName"
                        type="text"
                        placeholder="First name"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-100 border border-slate-200 text-slate-900 rounded-xl placeholder-slate-450 focus:outline-none focus:border-blue-500/50 text-xs h-10 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-slate-600"
                        value={signUpData.firstName}
                        onChange={handleSignUpChange}
                      />
                    </div>
                    <div className="relative group">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                      <input
                        name="lastName"
                        type="text"
                        placeholder="Last name"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-100 border border-slate-200 text-slate-900 rounded-xl placeholder-slate-450 focus:outline-none focus:border-blue-500/50 text-xs h-10 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-slate-600"
                        value={signUpData.lastName}
                        onChange={handleSignUpChange}
                      />
                    </div>
                  </div>

                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <input
                      name="email"
                      type="email"
                      placeholder="Email address"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-100 border border-slate-200 text-slate-900 rounded-xl placeholder-slate-450 focus:outline-none focus:border-blue-500/50 text-xs h-10 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-slate-600"
                      value={signUpData.email}
                      onChange={handleSignUpChange}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative group">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                      <input
                        name="password"
                        type={showSignUpPassword ? "text" : "password"}
                        placeholder="Password"
                        className="w-full pl-9 pr-8 py-2.5 bg-slate-100 border border-slate-200 text-slate-900 rounded-xl placeholder-slate-450 focus:outline-none focus:border-blue-500/50 text-xs h-10 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-slate-600"
                        value={signUpData.password}
                        onChange={handleSignUpChange}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        className="absolute right-2 top-2.5 text-slate-500 focus:outline-none"
                      >
                        {showSignUpPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                      <input
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm"
                        className="w-full pl-9 pr-8 py-2.5 bg-slate-100 border border-slate-200 text-slate-900 rounded-xl placeholder-slate-450 focus:outline-none focus:border-blue-500/50 text-xs h-10 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-slate-600"
                        value={signUpData.confirmPassword}
                        onChange={handleSignUpChange}
                        onKeyDown={(e) => e.key === 'Enter' && handleSignUpSubmit()}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 top-2.5 text-slate-500 focus:outline-none"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="relative group">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <input
                      name="phone"
                      type="tel"
                      placeholder="Phone number (Optional)"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-100 border border-slate-200 text-slate-900 rounded-xl placeholder-slate-450 focus:outline-none focus:border-blue-500/50 text-xs h-10 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-slate-600"
                      value={signUpData.phone}
                      onChange={handleSignUpChange}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={isLogin ? handleLoginSubmit : handleSignUpSubmit}
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-500/25 h-11 font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {loading
                  ? isLogin
                    ? "Signing in..."
                    : "Creating account..."
                  : isLogin
                    ? "Sign In"
                    : "Create Account"}
                <ArrowRight className="w-4 h-4 animate-pulse" />
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-[#0c0d21] px-3 text-slate-550 dark:text-slate-500">
                  Or continue with
                </span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center border border-slate-200 bg-white text-slate-700 hover:bg-slate-550 hover:text-slate-950 rounded-xl h-11 text-xs transition-all cursor-pointer disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <LogIn className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" />
              Google Account
            </button>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              {isLogin ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={toggleMode}
                    className="text-blue-600 hover:text-blue-500 font-bold transition-colors cursor-pointer bg-transparent border-none p-0 inline-block focus:outline-none dark:text-blue-400 dark:hover:text-blue-350"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={toggleMode}
                    className="text-blue-600 hover:text-blue-500 font-bold transition-colors cursor-pointer bg-transparent border-none p-0 inline-block focus:outline-none dark:text-blue-400 dark:hover:text-blue-350"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
