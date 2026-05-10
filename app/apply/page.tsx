'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Phone, Mail, BookOpen, Monitor, Wifi, MessageCircle, 
  Send, CheckCircle, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

const ApplyPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNo: '',
    email: '',
    course: '',
    category: '',
    whatsappNo: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const courses = [
    'MERN Stack Development',
    'Digital Marketing',
    'Graphic Designing',
    'Accounting for Freelancing'
  ];

  const categories = [
    'Online',
    'Offline',
    'Online + Offline'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({
          fullName: '',
          mobileNo: '',
          email: '',
          course: '',
          category: '',
          whatsappNo: ''
        });
      } else {
        throw new Error('Application failed');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('আবেদন জমা দেওয়ার সময় সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-12 max-w-md w-full text-center border border-white/20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>
          
          <h2 className="text-3xl font-bold text-white mb-4">আবেদন সফল!</h2>
          <p className="text-blue-100 mb-8">
            আপনার আবেদনটি সফলভাবে জমা হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।
          </p>
          
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            হোমপেজে ফিরে যান
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            হোমপেজে ফিরে যান
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            কোর্সে <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">আবেদন করুন</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            আপনার পছন্দের কোর্সে ভর্তির জন্য নিচের ফর্মটি পূরণ করুন এবং আপনার স্কিল ডেভেলপমেন্ট যাত্রা শুরু করুন
          </p>
        </motion.div>

        {/* Application Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="flex items-center gap-2 text-blue-100 font-medium mb-2">
                  <User className="w-4 h-4" />
                  পূর্ণ নাম *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  placeholder="আপনার পূর্ণ নাম লিখুন"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="flex items-center gap-2 text-blue-100 font-medium mb-2">
                  <Phone className="w-4 h-4" />
                  মোবাইল নম্বর *
                </label>
                <input
                  type="tel"
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  placeholder="০১XXXXXXXXX"
                />
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-blue-100 font-medium mb-2">
                  <Mail className="w-4 h-4" />
                  ইমেইল *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  placeholder="your@email.com"
                />
              </div>

              {/* Course Selection */}
              <div>
                <label className="flex items-center gap-2 text-blue-100 font-medium mb-2">
                  <BookOpen className="w-4 h-4" />
                  কোর্স নির্বাচন *
                </label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                >
                  <option value="" className="bg-gray-800">একটি কোর্স নির্বাচন করুন</option>
                  {courses.map((course) => (
                    <option key={course} value={course} className="bg-gray-800">
                      {course}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Selection */}
              <div>
                <label className="flex items-center gap-2 text-blue-100 font-medium mb-2">
                  <Monitor className="w-4 h-4" />
                  ক্যাটাগরি নির্বাচন *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                >
                  <option value="" className="bg-gray-800">ক্যাটাগরি নির্বাচন করুন</option>
                  {categories.map((category) => (
                    <option key={category} value={category} className="bg-gray-800">
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="flex items-center gap-2 text-blue-100 font-medium mb-2">
                  <MessageCircle className="w-4 h-4" />
                  হোয়াটসঅ্যাপ নম্বর *
                </label>
                <input
                  type="tel"
                  name="whatsappNo"
                  value={formData.whatsappNo}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  placeholder="০১XXXXXXXXX"
                />
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
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    জমা হচ্ছে...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    আবেদন জমা দিন
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default ApplyPage;
