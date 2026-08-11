'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, Phone, Mail, Upload, CreditCard, Calendar, 
  Send, CheckCircle, ArrowLeft, Camera, FileText,
  AlertCircle, Loader2
} from 'lucide-react';
import BestSpinner from '@/components/BestSpinner';

type EnrollmentSection = 'course' | 'seminar';

interface CourseEnrollmentForm {
  fullName: string;
  mobileNumber: string;
  email: string;
  transactionId: string;
  paymentScreenshot: File | null;
}

interface SeminarForm {
  fullName: string;
  mobileNumber: string;
  email: string;
  whatsappNumber: string;
}

export default function CourseEnrollPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [activeSection, setActiveSection] = useState<EnrollmentSection>('course');
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Course enrollment form state
  const [courseForm, setCourseForm] = useState<CourseEnrollmentForm>({
    fullName: '',
    mobileNumber: '',
    email: '',
    transactionId: '',
    paymentScreenshot: null
  });
  
  // Seminar form state
  const [seminarForm, setSeminarForm] = useState<SeminarForm>({
    fullName: '',
    mobileNumber: '',
    email: '',
    whatsappNumber: ''
  });

  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    // Allow unlogged-in users to access enrollment page
    fetchCourse();
  }, [router, slug]);

  const amountText = useMemo(() => {
    if (!course) return '';
    return `${course.current_price} ${course.currency || 'BDT'}`;
  }, [course]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${slug}`);
      if (!response.ok) {
        throw new Error('Course not found');
      }
      const data = await response.json();
      setCourse(data);
    } catch (error) {
      setMessage('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (file: File) => {
    setCourseForm({ ...courseForm, paymentScreenshot: file });
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

  const submitCourseEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    // Payment screenshot is now optional
    // if (!courseForm.paymentScreenshot) {
    //   setMessage('Please upload payment screenshot');
    //   return;
    // }

    setSubmitting(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      
      // Upload image to imgbb if provided
      let imageUrl = '';
      if (courseForm.paymentScreenshot) {
        try {
          imageUrl = await uploadToImgBB(courseForm.paymentScreenshot);
        } catch (error) {
          throw new Error('Failed to upload payment screenshot');
        }
      }

      // Prepare headers - include Authorization only if token exists
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const requestBody = {
          courseId: Number(course.id),
          fullName: courseForm.fullName,
          mobileNumber: courseForm.mobileNumber,
          email: courseForm.email,
          transactionId: courseForm.transactionId,
          paymentScreenshotUrl: imageUrl,
          amount: course.current_price,
          courseTitle: course.title,
          courseCategory: course.category || 'offline',
          coursePrice: course.current_price,
          batchName: course.batch_name || 'Current Batch',
          isGuestUser: !token // Flag to indicate guest enrollment
        };
        
        console.log('Submitting enrollment with data:', requestBody);
        console.log('User token exists:', !!token);

      const response = await fetch('/api/enhanced-enrollment/course', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Enrollment submission failed');
      }

      // Only show success if response is actually successful
      if (response.status === 200) {
        setIsSubmitted(true);
        setMessage('Enrollment submitted successfully! Please wait for admin approval.');
      }
    } catch (error: any) {
      setMessage(error.message || 'Failed to submit enrollment');
    } finally {
      setSubmitting(false);
    }
  };

  const submitSeminarApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/enhanced-enrollment/seminar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(seminarForm)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Seminar application failed');
      }

      setIsSubmitted(true);
      setMessage('Seminar application submitted successfully!');
      setSeminarForm({
        fullName: '',
        mobileNumber: '',
        email: '',
        whatsappNumber: ''
      });
    } catch (error: any) {
      setMessage(error.message || 'Failed to submit seminar application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <BestSpinner size="large" color="#ffffff" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center text-white">
        Course not found.
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-12 max-w-md w-full text-center border border-white/20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>
          
          <h2 className="text-3xl font-bold text-white mb-4">Application Successful!</h2>
          <p className="text-blue-100 mb-8">
            {activeSection === 'course' 
              ? 'Your enrollment has been submitted. We will review your payment and contact you soon.'
              : 'Your seminar application has been submitted. We will contact you with details.'
            }
          </p>
          
          <button 
            onClick={() => {
              setIsSubmitted(false);
              setCourseForm({
                fullName: '',
                mobileNumber: '',
                email: '',
                transactionId: '',
                paymentScreenshot: null
              });
              setPreviewUrl('');
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Apply Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background with Blue Glow */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-cyan-400/20 rounded-full blur-2xl animate-pulse animation-delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <button 
            onClick={() => router.push('/courses')}
            className="inline-flex items-center gap-2 text-blue-300 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </button>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Enroll Now</span>
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            Complete your enrollment and start your learning journey today
          </p>
        </motion.div>

        
        {/* Two Column Layout */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Payment Instructions */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-4 sm:p-8 border border-white/10 shadow-2xl">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-4">Payment Instructions</h3>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertCircle className="w-6 h-6 text-yellow-400" />
                      <h4 className="font-bold text-white text-lg">পেমেন্ট নির্দেশাবলী</h4>
                    </div>
                    <div className="space-y-3 text-blue-100">
                      <p className="text-lg leading-relaxed">
                        Bkash app থেকে payment option select করে <span className="font-bold text-white text-xl">01577296272</span> নম্বরে {course.current_price} টাকা payment করে screenshot অথবা trxid upload করুন...
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <h4 className="font-bold text-white mb-3">Payment Details</h4>
                    <div className="space-y-2 text-blue-200">
                      <p><span className="font-semibold">Number:</span> 01577296272</p>
                      <p><span className="font-semibold">Account:</span> Luminous Skill Development Training Center</p>
                      <p><span className="font-semibold">Amount:</span> {amountText}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Enrollment Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-4 sm:p-8 border border-white/10 shadow-2xl">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Enrollment Form</h3>
                <p className="text-blue-200">
                  Fill in your details and submit payment information
                </p>
              </div>

              <form onSubmit={submitCourseEnrollment} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="flex items-center gap-2 text-blue-100 font-medium mb-2">
                    <User className="w-4 h-4" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={courseForm.fullName}
                    onChange={(e) => setCourseForm({ ...courseForm, fullName: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="flex items-center gap-2 text-blue-100 font-medium mb-2">
                    <Phone className="w-4 h-4" />
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={courseForm.mobileNumber}
                    onChange={(e) => setCourseForm({ ...courseForm, mobileNumber: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                    placeholder="01XXXXXXXXX"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-blue-100 font-medium mb-2">
                    <Mail className="w-4 h-4" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={courseForm.email}
                    onChange={(e) => setCourseForm({ ...courseForm, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                    placeholder="your@email.com"
                  />
                </div>

                {/* Transaction ID */}
                <div>
                  <label className="flex items-center gap-2 text-blue-100 font-medium mb-2">
                    <CreditCard className="w-4 h-4" />
                    Transaction ID *
                  </label>
                  <input
                    type="text"
                    value={courseForm.transactionId}
                    onChange={(e) => setCourseForm({ ...courseForm, transactionId: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                    placeholder="Enter bKash transaction ID"
                  />
                </div>

                {/* Payment Screenshot Upload */}
                <div>
                    <label className="flex items-center gap-2 text-blue-100 font-medium mb-2">
                      <Camera className="w-4 h-4" />
                      Payment Screenshot (Optional)
                    </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                      className="hidden"
                      id="payment-screenshot"
                    />
                    <label
                      htmlFor="payment-screenshot"
                      className="flex items-center justify-center w-full px-4 py-6 sm:py-8 bg-white/5 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:bg-white/10 transition-all"
                    >
                      {previewUrl ? (
                        <div className="text-center">
                          <img src={previewUrl} alt="Payment screenshot" className="max-h-32 mx-auto mb-2 rounded-lg" />
                          <p className="text-sm text-green-400">Screenshot uploaded</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-blue-300" />
                          <p className="text-blue-200">Click to upload payment screenshot</p>
                          <p className="text-xs text-blue-300 mt-1">PNG, JPG up to 10MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Enrollment
                    </>
                  )}
                </motion.button>

                {/* Clear Form Button */}
                <motion.button
                  type="button"
                  onClick={() => {
                    setCourseForm({
                      fullName: '',
                      mobileNumber: '',
                      email: '',
                      transactionId: '',
                      paymentScreenshot: null
                    });
                    setPreviewUrl('');
                    setMessage('');
                    setIsSubmitted(false);
                    console.log('Form cleared');
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 px-8 py-3 bg-white/10 backdrop-blur-xl text-white rounded-xl font-bold hover:bg-white/20 transition-all border border-white/20"
                >
                  Clear Form
                </motion.button>

                {/* Seminar Button */}
                <div className="pt-4 border-t border-white/10">
                  <motion.button
                    type="button"
                    onClick={() => router.push('/apply')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-xl text-white rounded-xl font-bold hover:bg-white/20 transition-all border border-white/20"
                  >
                    <FileText className="w-5 h-5" />
                    Apply for Free Seminar
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Seminar Application Modal */}
        {activeSection === 'seminar' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/5 backdrop-blur-2xl rounded-3xl p-4 sm:p-8 border border-white/10 shadow-2xl max-w-md w-full"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Free Seminar Application</h3>
                <p className="text-blue-200">
                  Apply for our free skill development seminar
                </p>
              </div>

              <form onSubmit={submitSeminarApplication} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="flex items-center gap-2 text-blue-100 font-medium mb-2">
                    <User className="w-4 h-4" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={seminarForm.fullName}
                    onChange={(e) => setSeminarForm({ ...seminarForm, fullName: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="flex items-center gap-2 text-blue-100 font-medium mb-2">
                    <Phone className="w-4 h-4" />
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={seminarForm.mobileNumber}
                    onChange={(e) => setSeminarForm({ ...seminarForm, mobileNumber: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                    placeholder="01XXXXXXXXX"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-blue-100 font-medium mb-2">
                    <Mail className="w-4 h-4" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={seminarForm.email}
                    onChange={(e) => setSeminarForm({ ...seminarForm, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                    placeholder="your@email.com"
                  />
                </div>

                {/* WhatsApp Number */}
                <div>
                  <label className="flex items-center gap-2 text-blue-100 font-medium mb-2">
                    <Phone className="w-4 h-4" />
                    WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    name="whatsappNumber"
                    value={seminarForm.whatsappNumber}
                    onChange={(e) => setSeminarForm({ ...seminarForm, whatsappNumber: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                    placeholder="01XXXXXXXXX"
                  />
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Apply for Free Seminar
                    </>
                  )}
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => setActiveSection('course')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-xl text-white rounded-xl font-bold hover:bg-white/20 transition-all border border-white/20"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Enrollment
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Message Display */}
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mt-6"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 text-center">
              <p className="text-blue-200">{message}</p>
            </div>
          </motion.div>
        )}
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 8s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
