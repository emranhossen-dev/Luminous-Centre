'use client';

import React, { useEffect, useState } from 'react';
import { X, Save, Key } from 'lucide-react';
import { updateMentor } from '@/app/admin/mentors/add/actions';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

interface Mentor {
  id: number;
  name: string;
  email: string;
  phone?: string;
  designation?: string;
  experience?: string;
  bio?: string;
  skills?: any;
  linkedin?: string;
  github?: string;
  website?: string;
  status: string;
}

interface MentorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentor: Mentor | null;
  onSuccess: () => void;
}

export default function MentorModal({ isOpen, onClose, mentor, onSuccess }: MentorModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [designation, setDesignation] = useState('');
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mentor) {
      setName(mentor.name || '');
      setEmail(mentor.email || '');
      setPhone(mentor.phone || '');
      setPassword('');
      setDesignation(mentor.designation || '');
      setExperience(mentor.experience || '');
      setBio(mentor.bio || '');
      
      let skillsText = '';
      if (mentor.skills) {
        if (Array.isArray(mentor.skills)) {
          skillsText = mentor.skills.join(', ');
        } else {
          skillsText = String(mentor.skills);
        }
      }
      setSkills(skillsText);
      setLinkedin(mentor.linkedin || '');
      setGithub(mentor.github || '');
      setWebsite(mentor.website || '');
      setStatus(mentor.status || 'active');
    }
  }, [mentor, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !designation) {
      Swal.fire({
        title: 'Error!',
        text: 'Name, Email, and Designation are required fields.',
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        name,
        email,
        phone,
        password: password || undefined,
        designation,
        experience,
        bio,
        skills,
        linkedin,
        github,
        website,
        status
      };

      const result = await updateMentor(mentor!.id, data);

      if (result.success) {
        Swal.fire({
          title: 'Updated!',
          text: 'Mentor details have been updated successfully.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        onSuccess();
        onClose();
      } else {
        Swal.fire({
          title: 'Error!',
          text: result.error || 'Failed to update mentor details.',
          icon: 'error',
          confirmButtonColor: '#3b82f6'
        });
      }
    } catch (err: any) {
      Swal.fire({
        title: 'Error!',
        text: 'An unexpected error occurred.',
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden z-10"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Mentor Details</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Update mentor profile and change login security details</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Full Name *</label>
                  <input 
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Email Address *</label>
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Phone Number</label>
                  <input 
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">New Password (Optional)</label>
                  <div className="relative">
                    <input 
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                      placeholder="Leave blank to keep current"
                    />
                    <Key className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Designation *</label>
                  <input 
                    type="text"
                    required
                    value={designation}
                    onChange={e => setDesignation(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Experience</label>
                  <input 
                    type="text"
                    value={experience}
                    onChange={e => setExperience(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Status *</label>
                  <select 
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                  >
                    <option value="active" className="dark:bg-slate-900">Active</option>
                    <option value="suspended" className="dark:bg-slate-900">Suspended</option>
                    <option value="inactive" className="dark:bg-slate-900">Inactive</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Skills (Comma separated)</label>
                  <input 
                    type="text"
                    value={skills}
                    onChange={e => setSkills(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                    placeholder="React, Node.js, Python"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Biography</label>
                  <textarea 
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    rows={3}
                    className="flex w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">LinkedIn URL</label>
                  <input 
                    type="text"
                    value={linkedin}
                    onChange={e => setLinkedin(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">GitHub URL</label>
                  <input 
                    type="text"
                    value={github}
                    onChange={e => setGithub(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Website URL</label>
                  <input 
                    type="text"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                  <Save className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
