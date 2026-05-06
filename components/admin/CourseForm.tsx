"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Plus, Trash2, Info, CheckCircle2 } from 'lucide-react';

interface CourseFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CourseForm({ onClose, onSuccess }: CourseFormProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    short_description: '',
    category: 'Development',
    price: '',
    old_price: '',
    level: 'Beginner',
    duration_weeks: '',
    total_hours: '',
    thumbnail_url: '',
    status: 'published',
    featured: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const submissionData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        old_price: parseFloat(formData.old_price) || 0,
        duration_weeks: parseInt(formData.duration_weeks) || 0,
        total_hours: parseInt(formData.total_hours) || 0,
      };

      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submissionData)
      });

      if (response.ok) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Failed to create course:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create New Course</h2>
            <p className="text-sm text-gray-500">Fill in the details to publish a new learning path</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-8 py-4 bg-white border-b border-gray-100 flex items-center gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step >= s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              <div className={`h-1 w-12 rounded-full transition-colors ${
                step > s ? 'bg-blue-600' : 'bg-gray-100'
              }`} />
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar-main">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Course Title</label>
                    <input
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. Master MERN Stack Development"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Course Slug</label>
                    <input
                      name="slug"
                      required
                      value={formData.slug}
                      onChange={handleChange}
                      placeholder="e.g. master-mern-stack"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Thumbnail URL</label>
                    <input
                      name="thumbnail_url"
                      required
                      value={formData.thumbnail_url}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    >
                      <option>Development</option>
                      <option>Design</option>
                      <option>Marketing</option>
                      <option>Business</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Price (BDT)</label>
                    <input
                      name="price"
                      type="number"
                      required
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Old Price (Optional)</label>
                    <input
                      name="old_price"
                      type="number"
                      value={formData.old_price}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Duration (Weeks)</label>
                    <input
                      name="duration_weeks"
                      type="number"
                      value={formData.duration_weeks}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Total Hours</label>
                    <input
                      name="total_hours"
                      type="number"
                      value={formData.total_hours}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Short Description</label>
                  <textarea
                    name="short_description"
                    rows={3}
                    value={formData.short_description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
                  <Info className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-blue-900 mb-1">Ready to publish?</p>
                    <p className="text-xs text-blue-700">Make sure all details are correct. You can always edit the course later from the dashboard.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    id="featured"
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="w-5 h-5 text-blue-600 rounded-lg focus:ring-blue-500"
                  />
                  <label htmlFor="featured" className="text-sm font-bold text-gray-700 cursor-pointer">Mark as Featured Course</label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep(prev => Math.max(1, prev - 1))}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${
              step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Previous
          </button>
          
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(prev => Math.min(3, prev + 1))}
              className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
