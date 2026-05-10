'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Phone, Mail, BookOpen, Monitor, Wifi, MessageCircle, 
  Send, CheckCircle, X
} from 'lucide-react';
import BestSpinner from '@/components/BestSpinner';

interface SeminarForm {
  fullName: string;
  mobileNumber: string;
  email: string;
  whatsappNumber: string;
}

interface SeminarFormProps {
  onSubmit: (data: SeminarForm) => Promise<void>;
  onCancel: () => void;
}

const SeminarForm: React.FC<SeminarFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<SeminarForm>({
    fullName: '',
    mobileNumber: '',
    email: '',
    whatsappNumber: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      setFormData({
        fullName: '',
        mobileNumber: '',
        email: '',
        whatsappNumber: ''
      });
    } catch (error) {
      console.error('Error submitting seminar application:', error);
      alert('আবেদন জমা দেওয়ার সময় সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl max-w-md w-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Seminar Application</h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Grid for Desktop/Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <User className="w-4 h-4" />
                পূর্ণ নাম *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="আপনার পূর্ণ নাম লিখুন"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <Phone className="w-4 h-4" />
                মোবাইল নম্বর *
              </label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="০১XXXXXXXXX"
              />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <Mail className="w-4 h-4" />
                ইমেইল *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="your@email.com"
              />
            </div>

            {/* WhatsApp Number */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <MessageCircle className="w-4 h-4" />
                হোয়াটসঅ্যাপ নম্বর *
              </label>
              <input
                type="tel"
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="০১XXXXXXXXX"
              />
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25"
          >
            {isSubmitting ? (
              <>
                <BestSpinner size="small" color="#ffffff" />
                <span className="ml-2">Submitting...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span className="ml-2">Apply Now</span>
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default SeminarForm;
