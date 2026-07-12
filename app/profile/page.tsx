"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Lock, Mail, Shield, AlertCircle, CheckCircle, 
  RefreshCcw, KeyRound, Bell, Settings, Eye, EyeOff,
  Laptop, Smartphone, Globe, Calendar, MapPin, UserCheck
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ProfilePage() {
  const { user, token } = useAuth();
  const router = useRouter();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences' | 'activity'>('profile');

  // Loading States
  const [pageLoading, setPageLoading] = useState(true);

  // Profile Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [designation, setDesignation] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [roleName, setRoleName] = useState('');
  const [lastLogin, setLastLogin] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Preferences States
  const [language, setLanguage] = useState('bn');
  const [timezone, setTimezone] = useState('Asia/Dhaka');
  const [theme, setTheme] = useState('dark');
  const [notificationsEmail, setNotificationsEmail] = useState(true);
  const [notificationsSms, setNotificationsSms] = useState(false);
  const [notificationsMarketing, setNotificationsMarketing] = useState(false);
  const [notificationsCourseUpdates, setNotificationsCourseUpdates] = useState(true);

  // 2FA MOCK state
  const [twoFactor, setTwoFactor] = useState(false);

  // Activity & Loading states
  const [activities, setActivities] = useState<any[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [prefLoading, setPrefLoading] = useState(false);

  // Fetch full profile and preference data on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      router.push('/login');
      return;
    }
    fetchProfileData(savedToken);
    fetchActivityLogs(savedToken);
  }, [router]);

  const fetchProfileData = async (activeToken: string) => {
    try {
      setPageLoading(true);
      const res = await fetch('/api/auth/get-profile', {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      const data = await res.json();
      if (res.ok && data.profile) {
        const p = data.profile;
        setFirstName(p.firstName || '');
        setLastName(p.lastName || '');
        setEmail(p.email || '');
        setPhone(p.phone || '');
        // Format YYYY-MM-DD for input element
        if (p.dateOfBirth) {
          setDateOfBirth(p.dateOfBirth.split('T')[0]);
        } else {
          setDateOfBirth('');
        }
        setGender(p.gender || '');
        setAddress(p.address || '');
        setDesignation(p.designation || '');
        setAvatarUrl(p.avatarUrl || '');
        setRoleName(p.roleName || '');
        setLastLogin(p.lastLogin || '');
        setBio(p.bio || '');
        setSkills(p.skills ? (Array.isArray(p.skills) ? p.skills.join(', ') : p.skills) : '');
        setLanguage(p.language || 'bn');
        setTimezone(p.timezone || 'Asia/Dhaka');
        setTheme(p.theme || 'dark');
        setNotificationsEmail(p.notificationsEmail ?? true);
        setNotificationsSms(p.notificationsSms ?? false);
        setNotificationsMarketing(p.notificationsMarketing ?? false);
        setNotificationsCourseUpdates(p.notificationsCourseUpdates ?? true);
      }
    } catch (e) {
      console.error('Failed to load profile details:', e);
    } finally {
      setPageLoading(false);
    }
  };

  const fetchActivityLogs = async (activeToken: string) => {
    try {
      const res = await fetch('/api/auth/activity-log', {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      const data = await res.json();
      if (res.ok && data.logs) {
        setActivities(data.logs);
      }
    } catch (e) {
      console.error('Failed to load activity logs:', e);
    }
  };

  // Handle Save Personal Profile Details
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          dateOfBirth,
          gender,
          address,
          designation,
          avatarUrl,
          bio,
          skills
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Personal profile details saved successfully! ✨');
        // Refresh logs
        if (token) fetchActivityLogs(token);
      } else {
        toast.error(data.error || 'Failed to save profile changes');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle Save Preferences & Notifications Settings
  const handleSavePreferences = async () => {
    setPrefLoading(true);
    try {
      const res = await fetch('/api/auth/update-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          language,
          timezone,
          theme,
          notificationsEmail,
          notificationsSms,
          notificationsMarketing,
          notificationsCourseUpdates
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Dashboard preferences saved successfully! ⚙️');
        if (token) fetchActivityLogs(token);
      } else {
        toast.error(data.error || 'Failed to save preferences');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setPrefLoading(false);
    }
  };

  // Handle Change Password Form Submit
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);

    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      setPasswordLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Password changed successfully! 🔐');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        if (token) fetchActivityLogs(token);
      } else {
        toast.error(data.error || 'Failed to change password');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F9FAFB] pt-24 pb-16 px-4 md:px-8 relative overflow-hidden font-sans">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#3B82F6]/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#3B82F6]/5 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Title Area */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight mb-2">My Profile</h1>
          <p className="text-[#9CA3AF] text-sm">Manage your account information and preferences.</p>
        </div>

        {/* Top Profile Card */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl flex flex-col md:flex-row gap-8 items-center mb-8">
          {/* Avatar Area */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-28 h-28 rounded-full bg-gradient-to-r from-[#3B82F6] to-blue-500 border border-[#1F2937] flex items-center justify-center text-white font-extrabold text-4xl shadow-lg relative overflow-hidden group">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                firstName?.charAt(0) || user?.email?.charAt(0) || 'U'
              )}
            </div>
            <button
              onClick={() => {
                const url = prompt("Enter avatar image URL:");
                if (url !== null) {
                  setAvatarUrl(url);
                }
              }}
              className="text-xs font-bold text-[#3B82F6] hover:text-blue-400 transition-colors cursor-pointer"
            >
              Change Photo
            </button>
          </div>

          {/* Details Area */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <h2 className="text-2xl font-black text-[#F9FAFB]">
              {firstName} {lastName}
            </h2>
            <p className="text-[#9CA3AF] text-sm font-bold tracking-wide uppercase">{designation || 'LSDTC Member'}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 pt-2 text-sm text-[#9CA3AF]">
              <span className="flex items-center gap-1.5">📧 {email}</span>
              <span className="flex items-center gap-1.5">📱 {phone || 'No phone provided'}</span>
              <span className="flex items-center gap-1.5">
                🛡️ <span className={`inline px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase border ${getRoleColor(roleName)}`}>
                  {roleName}
                </span>
              </span>
              <span className="flex items-center gap-1.5">🟢 Status: Active</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex flex-wrap border-b border-[#1F2937] mb-8 gap-1">
          {[
            { id: 'profile', label: '👤 Profile' },
            { id: 'security', label: '🔒 Security' },
            { id: 'notifications', label: '🔔 Notifications' },
            { id: 'preferences', label: '⚙️ Preferences' },
            { id: 'activity', label: '📜 Activity Log' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#3B82F6] text-[#3B82F6]'
                  : 'border-transparent text-[#9CA3AF] hover:text-[#F9FAFB] hover:border-[#1F2937]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Rendering */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            {/* TAB 1: Profile Info Form */}
            {activeTab === 'profile' && (
              <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex items-center gap-2.5 border-b border-[#1F2937] pb-4 mb-4">
                  <User className="w-5 h-5 text-[#3B82F6]" />
                  <h3 className="text-xl font-bold text-white">Personal Information</h3>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">First Name</label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#0B1120] border border-[#1F2937] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 text-sm text-[#F9FAFB] placeholder-gray-600 transition-all"
                        placeholder="John"
                      />
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Last Name</label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#0B1120] border border-[#1F2937] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 text-sm text-[#F9FAFB] placeholder-gray-600 transition-all"
                        placeholder="Doe"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Email Address</label>
                      <input
                        type="email"
                        disabled
                        value={email}
                        className="w-full px-4 py-2.5 bg-[#0B1120] border border-[#1F2937] rounded-xl opacity-60 text-sm text-[#9CA3AF] cursor-not-allowed"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Phone Number</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#0B1120] border border-[#1F2937] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 text-sm text-[#F9FAFB] placeholder-gray-600 transition-all"
                        placeholder="+8801700000000"
                      />
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Date of Birth</label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          className="w-full pl-11 pr-4 py-2.5 bg-[#0B1120] border border-[#1F2937] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 text-sm text-[#F9FAFB] transition-all"
                        />
                      </div>
                    </div>

                    {/* Gender */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#0B1120] border border-[#1F2937] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 text-sm text-[#F9FAFB] transition-all"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>

                    {/* Designation / Job Title */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Designation / Title</label>
                      <input
                        type="text"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#0B1120] border border-[#1F2937] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 text-sm text-[#F9FAFB] placeholder-gray-600 transition-all"
                        placeholder="Full Stack Developer"
                      />
                    </div>

                    {/* Address */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Residential Address</label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-gray-500 absolute left-4 top-4" />
                        <textarea
                          rows={3}
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full pl-11 pr-4 py-2.5 bg-[#0B1120] border border-[#1F2937] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 text-sm text-[#F9FAFB] placeholder-gray-600 transition-all"
                          placeholder="House 123, Road 4, Sector 7, Uttara, Dhaka"
                        />
                      </div>
                    </div>

                    {/* Mentor Biography */}
                    {roleName === 'mentor' && (
                      <>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Expert Skills (comma-separated)</label>
                          <input
                            type="text"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            className="w-full px-4 py-2.5 bg-[#0B1120] border border-[#1F2937] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 text-sm text-[#F9FAFB] placeholder-gray-600 transition-all"
                            placeholder="React, Next.js, TypeScript, Node.js"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <label className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Biography / Professional Profile</label>
                          <textarea
                            rows={4}
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full px-4 py-2.5 bg-[#0B1120] border border-[#1F2937] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 text-sm text-[#F9FAFB] placeholder-gray-600 transition-all"
                            placeholder="Describe your professional career, expertise, and teaching background..."
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="border-t border-[#1F2937] pt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="px-6 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95 duration-200 cursor-pointer"
                    >
                      {profileLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: Security & Password Updating */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                {/* Change Password Card */}
                <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-6 sm:p-8 shadow-xl">
                  <div className="flex items-center gap-2.5 border-b border-[#1F2937] pb-4 mb-6">
                    <KeyRound className="w-5 h-5 text-[#3B82F6]" />
                    <h3 className="text-xl font-bold text-white">Update Password</h3>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Current Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full pl-11 pr-12 py-2.5 bg-[#0B1120] border border-[#1F2937] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 text-sm text-[#F9FAFB] placeholder-gray-600 transition-all"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">New Password</label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full pl-11 pr-12 py-2.5 bg-[#0B1120] border border-[#1F2937] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 text-sm text-[#F9FAFB] placeholder-gray-600 transition-all"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Confirm New Password</label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input
                            type={showConfirmNewPassword ? 'text' : 'password'}
                            required
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className="w-full pl-11 pr-12 py-2.5 bg-[#0B1120] border border-[#1F2937] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 text-sm text-[#F9FAFB] placeholder-gray-600 transition-all"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                          >
                            {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-[#1F2937] pt-6 flex justify-end">
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="px-6 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95 duration-200 cursor-pointer"
                      >
                        {passwordLoading ? 'Updating...' : 'Change Password'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Two Factor Card */}
                <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="space-y-1.5 text-center sm:text-left">
                    <h4 className="text-lg font-bold text-white">Two-Factor Authentication</h4>
                    <p className="text-[#9CA3AF] text-sm">Add an extra layer of security to your account.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#9CA3AF]">{twoFactor ? 'ENABLED' : 'DISABLED'}</span>
                    <button
                      onClick={() => {
                        setTwoFactor(!twoFactor);
                        toast.info(`Two-Factor Authentication has been ${!twoFactor ? 'simulated as enabled' : 'disabled'}.`);
                      }}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                        twoFactor ? 'bg-[#22C55E]' : 'bg-[#1F2937]'
                      }`}
                    >
                      <span
                        className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                          twoFactor ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Active Sessions Card */}
                <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-6 sm:p-8 shadow-xl">
                  <div className="border-b border-[#1F2937] pb-4 mb-4">
                    <h4 className="text-lg font-bold text-white mb-1">Active Sessions</h4>
                    <p className="text-[#9CA3AF] text-sm">Devices currently logged in to your account.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#0B1120] border border-[#1F2937] rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-[#3B82F6]">
                          <Laptop className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Windows PC · Chrome Browser</p>
                          <p className="text-xs text-[#9CA3AF]">
                            Dhaka, Bangladesh · Active Session
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20 text-[10px] font-bold rounded-full uppercase">
                        Current
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[#0B1120] border border-[#1F2937] rounded-2xl opacity-75">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Android Phone · Chrome Mobile</p>
                          <p className="text-xs text-[#9CA3AF]">
                            Last activity: 2 hours ago
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Notifications Settings */}
            {activeTab === 'notifications' && (
              <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex items-center gap-2.5 border-b border-[#1F2937] pb-4 mb-4">
                  <Bell className="w-5 h-5 text-[#3B82F6]" />
                  <h3 className="text-xl font-bold text-white">Notifications Preferences</h3>
                </div>

                <div className="space-y-6 divide-y divide-[#1F2937]">
                  {/* Email Switch */}
                  <div className="flex items-center justify-between pt-4 first:pt-0">
                    <div className="space-y-1 pr-6">
                      <h4 className="text-sm font-bold text-white">Email Notifications</h4>
                      <p className="text-xs text-[#9CA3AF] leading-relaxed">
                        Receive system announcements, enrollments receipts, and course alerts to your mailbox.
                      </p>
                    </div>
                    <button
                      onClick={() => setNotificationsEmail(!notificationsEmail)}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none shrink-0 ${
                        notificationsEmail ? 'bg-[#3B82F6]' : 'bg-[#1F2937]'
                      }`}
                    >
                      <span
                        className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                          notificationsEmail ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* SMS Switch */}
                  <div className="flex items-center justify-between pt-6">
                    <div className="space-y-1 pr-6">
                      <h4 className="text-sm font-bold text-white">SMS Alerts</h4>
                      <p className="text-xs text-[#9CA3AF] leading-relaxed">
                        Receive immediate mobile texts for security overrides, direct enrollment updates, and OTPs.
                      </p>
                    </div>
                    <button
                      onClick={() => setNotificationsSms(!notificationsSms)}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none shrink-0 ${
                        notificationsSms ? 'bg-[#3B82F6]' : 'bg-[#1F2937]'
                      }`}
                    >
                      <span
                        className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                          notificationsSms ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Course Updates Switch */}
                  <div className="flex items-center justify-between pt-6">
                    <div className="space-y-1 pr-6">
                      <h4 className="text-sm font-bold text-white">Course Materials & Cycles</h4>
                      <p className="text-xs text-[#9CA3AF] leading-relaxed">
                        Stay notified when mentors upload new modules, assignments, or publish new quizzes.
                      </p>
                    </div>
                    <button
                      onClick={() => setNotificationsCourseUpdates(!notificationsCourseUpdates)}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none shrink-0 ${
                        notificationsCourseUpdates ? 'bg-[#3B82F6]' : 'bg-[#1F2937]'
                      }`}
                    >
                      <span
                        className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                          notificationsCourseUpdates ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Marketing Switch */}
                  <div className="flex items-center justify-between pt-6">
                    <div className="space-y-1 pr-6">
                      <h4 className="text-sm font-bold text-white">Promotions & Marketing</h4>
                      <p className="text-xs text-[#9CA3AF] leading-relaxed">
                        Receive emails on new launches, free webinars, discount campaigns, and new skill workshops.
                      </p>
                    </div>
                    <button
                      onClick={() => setNotificationsMarketing(!notificationsMarketing)}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none shrink-0 ${
                        notificationsMarketing ? 'bg-[#3B82F6]' : 'bg-[#1F2937]'
                      }`}
                    >
                      <span
                        className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                          notificationsMarketing ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="border-t border-[#1F2937] pt-6 flex justify-end">
                  <button
                    onClick={handleSavePreferences}
                    disabled={prefLoading}
                    className="px-6 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95 duration-200 cursor-pointer"
                  >
                    {prefLoading ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: Preferences (Language, Timezone, Theme) */}
            {activeTab === 'preferences' && (
              <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex items-center gap-2.5 border-b border-[#1F2937] pb-4 mb-4">
                  <Settings className="w-5 h-5 text-[#3B82F6]" />
                  <h3 className="text-xl font-bold text-white">Dashboard Preferences</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Language */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Language Preference</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0B1120] border border-[#1F2937] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 text-sm text-[#F9FAFB] transition-all"
                    >
                      <option value="bn">Bengali (বাংলা)</option>
                      <option value="en">English (US)</option>
                    </select>
                  </div>

                  {/* Timezone */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">System Timezone</label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-[#0B1120] border border-[#1F2937] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 text-sm text-[#F9FAFB] transition-all"
                      >
                        <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                        <option value="UTC">UTC (Coordinated Universal Time)</option>
                        <option value="America/New_York">America/New_York (EST)</option>
                        <option value="Europe/London">Europe/London (GMT)</option>
                      </select>
                    </div>
                  </div>

                  {/* Theme */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Portal Theme Mode</label>
                    <select
                      value={theme}
                      onChange={(e) => {
                        setTheme(e.target.value);
                        toast.info(`Theme changed to ${e.target.value}`);
                      }}
                      className="w-full px-4 py-2.5 bg-[#0B1120] border border-[#1F2937] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 text-sm text-[#F9FAFB] transition-all"
                    >
                      <option value="dark">Dark Theme (Default)</option>
                      <option value="blue">Premium Blue Theme</option>
                      <option value="light">Light Theme</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-[#1F2937] pt-6 flex justify-end">
                  <button
                    onClick={handleSavePreferences}
                    disabled={prefLoading}
                    className="px-6 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95 duration-200 cursor-pointer"
                  >
                    {prefLoading ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 5: Activity Logs list */}
            {activeTab === 'activity' && (
              <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-6 sm:p-8 shadow-xl">
                <div className="border-b border-[#1F2937] pb-4 mb-6">
                  <h3 className="text-xl font-bold text-white mb-1">Recent Activity Log</h3>
                  <p className="text-[#9CA3AF] text-sm">Security auditing audit logs for your account actions.</p>
                </div>

                {activities.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-6">No recent actions recorded.</p>
                ) : (
                  <div className="relative pl-6 border-l-2 border-[#1F2937] space-y-8 py-2">
                    {activities.map((act) => (
                      <div key={act.id} className="relative">
                        {/* Circle Bullet */}
                        <div className="absolute w-3.5 h-3.5 bg-[#3B82F6] border-4 border-[#111827] rounded-full -left-[27px] top-1" />
                        
                        <div>
                          <p className="text-sm font-bold text-[#F9FAFB]">
                            {act.action === 'user.login' ? '✔ Logged In Successfully' : `✔ ${act.action}`}
                          </p>
                          <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed">
                            {act.details?.message || 'Activity successfully audited'}
                          </p>
                          <span className="text-[10px] text-gray-500 font-bold uppercase mt-2 block tracking-wider">
                            🕒 {new Date(act.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}

function getRoleColor(role: string) {
  switch (role?.toLowerCase()) {
    case 'admin':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'employee':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'mentor':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    default:
      return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
  }
}
