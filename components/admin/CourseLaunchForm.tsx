"use client";

import React, { useState } from 'react';
import { Plus, Trash2, Upload, Check, Calendar, Users, CheckSquare } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CourseFormData, CourseSubmission } from '@/types/course';

interface CourseLaunchFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const weekDays = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const weekDayFullNames = {
  'Sat': 'Saturday',
  'Sun': 'Sunday', 
  'Mon': 'Monday',
  'Tue': 'Tuesday',
  'Wed': 'Wednesday',
  'Thu': 'Thursday',
  'Fri': 'Friday'
};

export default function CourseLaunchForm({ onClose, onSuccess }: CourseLaunchFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    slug: '',
    thumbnail_url: '',
    category: 'online',
    price: '',
    old_price: '',
    description: '',
    access_type: 'paid',
    status: 'draft',
    featured: false,
    batch: '',
    enrollment_ends: '',
    class_starts: '',
    selected_days: [],
    course_outline_url: ''
  });

  const [slugError, setSlugError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'slug') {
      const slugValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
      setFormData(prev => ({ ...prev, [name]: slugValue }));
      
      if (slugValue !== value.toLowerCase()) {
        setSlugError('Only lowercase letters, numbers, and hyphens allowed');
      } else {
        setSlugError('');
      }
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
      }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setSelectedFile(file);
  };

  const handleImageUpload = async () => {
    if (!selectedFile) return;

    setUploadingImage(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', selectedFile);
      const token = localStorage.getItem('token');

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData,
      });

      const data = await response.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, thumbnail_url: data.url }));
        toast.success('Image uploaded successfully!');
        setSelectedFile(null);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('PDF selection triggered');
    console.log('Files:', e.target.files);
    console.log('Files length:', e.target.files?.length);
    
    const file = e.target.files?.[0];
    console.log('Selected file:', file);
    
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Check file type
    if (file.type !== 'application/pdf') {
      console.log('Invalid file type:', file.type);
      toast.error('Please upload a PDF file');
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      console.log('File too large:', file.size);
      toast.error('PDF size must be less than 10MB');
      return;
    }

    console.log('Setting selected PDF');
    setSelectedPdf(file);
    console.log('PDF selection completed');
  };

  const handlePdfUpload = async () => {
    console.log('PDF upload triggered');
    console.log('Selected PDF:', selectedPdf);
    
    if (!selectedPdf) {
      console.log('No selected PDF to upload');
      return;
    }

    console.log('Starting upload process');
    setUploadingPdf(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('pdf', selectedPdf);
      uploadFormData.append('courseSlug', formData.slug || 'course');
      
      console.log('FormData created with:', {
        pdf: selectedPdf.name,
        courseSlug: formData.slug || 'course'
      });

      const response = await fetch('/api/admin/upload-pdf', {
        method: 'POST',
        body: uploadFormData,
      });

      console.log('Upload response status:', response.status);
      console.log('Upload response ok:', response.ok);

      const data = await response.json();
      console.log('Upload response data:', data);
      
      if (data.success) {
        console.log('Setting real Supabase URL:', data.url);
        
        setFormData(prev => ({ ...prev, course_outline_url: data.url }));
        toast.success('Course outline uploaded successfully!');
        setSelectedPdf(null);
        
        console.log('Real upload completed successfully');
      } else {
        console.log('Upload failed:', data.error);
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('PDF upload failed:', error);
      toast.error('Failed to upload PDF. Please try again.');
    } finally {
      console.log('Upload process finished');
      setUploadingPdf(false);
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
    setFormData(prev => ({ 
      ...prev, 
      selected_days: selectedDays.includes(day) 
        ? selectedDays.filter(d => d !== day) 
        : [...selectedDays, day]
    }));
  };

  const generateSlug = (title: string) => {
    const slug = title
      .toLowerCase()
      // Keep only letters, numbers, spaces, and hyphens
      .replace(/[^a-z0-9\s-]/g, '')
      // Replace multiple spaces with single hyphen
      .replace(/\s+/g, '-')
      // Replace multiple hyphens with single hyphen
      .replace(/-+/g, '-')
      // Remove leading/trailing hyphens and spaces
      .trim()
      // Remove hyphens at the end
      .replace(/-+$/, '');
    
    setFormData(prev => ({ ...prev, slug }));
    setSlugError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (slugError) {
      toast.error('Please fix the slug error before submitting');
      return;
    }

    if (!formData.thumbnail_url) {
      toast.error('Please add a course banner image');
      return;
    }

    if (!formData.title || !formData.slug || !formData.category) {
      toast.error('Title, slug, and category are required');
      return;
    }

    if (!formData.enrollment_ends || !formData.class_starts) {
      toast.error('Enrollment end date and class start date are required');
      console.log('Missing dates:', { enrollment_ends: formData.enrollment_ends, class_starts: formData.class_starts });
      return;
    }

    // Log the form data before submission
    console.log('Final form data before submission:', {
      enrollment_ends: formData.enrollment_ends,
      class_starts: formData.class_starts,
      batch: formData.batch,
      title: formData.title,
      category: formData.category
    });

    if (!formData.batch) {
      toast.error('Batch number is required');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Format the data for submission
      const submissionData: CourseSubmission = {
        ...formData,
        batch: `Batch-${formData.batch.padStart(2, '0')}`,
        price: parseFloat(formData.price as string) || 0,
        old_price: parseFloat(formData.old_price as string) || 0,
        selected_days: selectedDays
      };

      console.log('Submitting course data:', submissionData);

      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submissionData)
      });

      const data = await response.json();
      console.log('API Response:', data);
      
      if (response.ok) {
        toast.success('Course created successfully! 🎉');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        let errorMessage = data.error || 'Failed to create course';
        if (data.details) {
          errorMessage += ': ' + data.details;
        }
        
        // Comprehensive error logging
        console.error('=== COURSE CREATION FAILED ===');
        console.error('Error Message:', errorMessage);
        console.error('Full API Response:', data);
        console.error('Response Status:', response.status);
        console.error('Response Headers:', Object.fromEntries(response.headers.entries()));
        console.error('Submitted Data:', submissionData);
        
        // Show specific error details
        if (data.details) {
          toast.error(`Creation failed: ${data.details}`, {
            position: 'top-right'
          });
        } else {
          toast.error(errorMessage, {
            position: 'top-right'
          });
        }
        
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Failed to create course:', error);
      toast.error(error.message || 'Failed to create course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Launch New Course</h1>
          <p className="text-slate-400 mt-1">Create and publish a new course to Luminous Skills platform</p>
        </div>
      </header>

      <form id="courseForm" onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECTION 1: Basic Information */}
        <section className="glass-card p-6 md:p-8 rounded-3xl space-y-6" style={{
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h2 className="text-xl font-semibold flex items-center gap-2 text-emerald-400">
            <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
            Course Information
          </h2>
          
          <div className="space-y-6">
            {/* Title & Slug together, Description below */}
            <div className="space-y-6">
              {/* Title & Slug */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Course Title</label>
                  <input 
                    type="text" 
                    name="title" 
                    value={formData.title}
                    onChange={(e) => {
                      handleChange(e);
                      if (!formData.slug) {
                        generateSlug(e.target.value);
                      }
                    }}
                    required 
                    placeholder="e.g. Cyber Security And Ethical Hacking" 
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Course Slug (URL)</label>
                  <div className="flex items-center bg-slate-900/50 border border-slate-700 rounded-xl px-4 overflow-hidden group focus-within:border-emerald-500 transition">
                    <span className="text-slate-500 text-xs hidden sm:inline">courses/</span>
                    <input 
                      type="text" 
                      name="slug" 
                      value={formData.slug}
                      onChange={handleChange}
                      required 
                      pattern="^[a-z0-9-]+$" 
                      placeholder="cyber-security-101"
                      className="bg-transparent flex-1 py-3 text-sm outline-none placeholder:text-slate-600"
                    />
                  </div>
                  {slugError && (
                    <p className="text-red-400 text-xs mt-2 px-1">{slugError}</p>
                  )}
                  <p className="text-[11px] text-slate-500 mt-2 px-1">Lowercase, numbers, and hyphens only.</p>
                </div>
              </div>

              {/* Description - Full Width */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Course Description</label>
                <textarea 
                  name="description" 
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Full course details here - what students will learn, prerequisites, outcomes, etc." 
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition resize-none"
                />
              </div>
            </div>

            {/* File Uploads - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Banner Image */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Course Banner Image</label>
                
                {/* Preview Area */}
                {(formData.thumbnail_url || selectedFile) && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-700">
                    <img 
                      src={selectedFile ? URL.createObjectURL(selectedFile) : formData.thumbnail_url} 
                      alt="Course banner preview" 
                      className="w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setFormData(prev => ({ ...prev, thumbnail_url: '' }));
                      }}
                      className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                {/* File Selection Area */}
                <div className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden group ${
                  selectedFile 
                    ? 'border-emerald-500/50 bg-emerald-500/5' 
                    : 'border-slate-700 bg-slate-900/30 hover:bg-slate-900/50'
                }`}>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    disabled={uploadingImage}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                  />
                  {selectedFile ? (
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
                        <Check className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-xs font-medium text-emerald-400 mb-1">{selectedFile.name}</span>
                      <span className="text-[10px] text-slate-500">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-slate-500 mb-1 group-hover:text-emerald-400 transition" />
                      <span className="text-xs text-slate-400">Click to upload image</span>
                      <span className="text-[9px] text-slate-600 mt-1">JPG, PNG, WEBP (Max 2MB)</span>
                    </>
                  )}
                </div>

                {/* Upload Button */}
                {selectedFile && (
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    disabled={uploadingImage}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    {uploadingImage ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-3 h-3" />
                        Upload Image
                      </>
                    )}
                  </button>
                )}
                
                {/* URL Input */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-px bg-slate-800 flex-1"></div>
                    <span className="text-[9px] text-slate-600 uppercase font-bold">or use link</span>
                    <div className="h-px bg-slate-800 flex-1"></div>
                  </div>
                  <input 
                    type="url" 
                    name="thumbnail_url"
                    value={formData.thumbnail_url}
                    onChange={handleChange}
                    placeholder="Paste image URL here..." 
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Course Outline PDF */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Course Outline PDF</label>
                
                {/* Preview Area */}
                {(formData.course_outline_url || selectedPdf) && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900/50">
                    {/* PDF Preview */}
                    <div className="relative h-48 bg-slate-800/50">
                      {selectedPdf ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <iframe
                            src={URL.createObjectURL(selectedPdf)}
                            className="w-full h-full"
                            title="PDF Preview"
                          />
                        </div>
                      ) : formData.course_outline_url ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <iframe
                            src={formData.course_outline_url}
                            className="w-full h-full"
                            title="PDF Preview"
                          />
                        </div>
                      ) : null}
                      
                      {/* Overlay Info */}
                      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-blue-400" />
                          <span className="text-xs font-medium text-white">
                            {selectedPdf ? selectedPdf.name : 'Course Outline PDF'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 mt-1">
                          {selectedPdf ? `${(selectedPdf.size / 1024 / 1024).toFixed(2)} MB` : 'Uploaded successfully'}
                        </p>
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPdf(null);
                          setFormData(prev => ({ ...prev, course_outline_url: '' }));
                        }}
                        className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* View Link */}
                    {formData.course_outline_url && (
                      <div className="p-3 bg-slate-900/50 border-t border-slate-700">
                        <a 
                          href={formData.course_outline_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition bg-blue-500/10 px-3 py-2 rounded-lg"
                        >
                          <span>Open PDF in New Tab</span>
                          <span>↗</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}
                
                {/* PDF Selection Area */}
                <div className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden group ${
                  selectedPdf 
                    ? 'border-blue-500/50 bg-blue-500/5' 
                    : 'border-slate-700 bg-slate-900/30 hover:bg-slate-900/50'
                }`}>
                  <input
                    type="file"
                    onChange={handlePdfSelect}
                    disabled={uploadingPdf}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept=".pdf"
                  />
                  {selectedPdf ? (
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                        <Check className="w-5 h-5 text-blue-400" />
                      </div>
                      <span className="text-xs font-medium text-blue-400 mb-1">{selectedPdf.name}</span>
                      <span className="text-[10px] text-slate-500">({(selectedPdf.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-slate-500 mb-1 group-hover:text-blue-400 transition" />
                      <span className="text-xs text-slate-400">Click to upload PDF</span>
                      <span className="text-[9px] text-slate-600 mt-1">PDF only (Max 10MB)</span>
                    </>
                  )}
                </div>

                {/* Upload Button */}
                {selectedPdf && (
                  <button
                    type="button"
                    onClick={handlePdfUpload}
                    disabled={uploadingPdf}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    {uploadingPdf ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        Uploading PDF...
                      </>
                    ) : (
                      <>
                        <Upload className="w-3 h-3" />
                        Upload PDF
                      </>
                    )}
                  </button>
                )}
                
                {/* URL Input for PDF */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-px bg-slate-800 flex-1"></div>
                    <span className="text-[9px] text-slate-600 uppercase font-bold">or use link</span>
                    <div className="h-px bg-slate-800 flex-1"></div>
                  </div>
                  <div className="relative">
                    <input 
                      type="url" 
                      name="course_outline_url"
                      value={formData.course_outline_url}
                      onChange={handleChange}
                      placeholder="Paste PDF URL here..." 
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500 transition pr-20"
                    />
                    {formData.course_outline_url && (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(formData.course_outline_url);
                          toast.success('PDF URL copied to clipboard!');
                        }}
                        className="absolute right-1 top-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition"
                      >
                        Copy
                      </button>
                    )}
                  </div>
                  {formData.course_outline_url && (
                    <div className="text-xs text-slate-400">
                      <span className="font-medium">Generated URL:</span> 
                      <span className="block mt-1 p-2 bg-slate-800 rounded text-blue-400 break-all">
                        {formData.course_outline_url}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Course Details */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Course Settings */}
          <div className="glass-card p-6 rounded-3xl space-y-4 col-span-2" style={{
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 className="text-lg font-medium text-slate-300">Course Settings</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">Category / Type</label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="recorded">Recorded</option>
                  <option value="project">Govt Project</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">Access Type</label>
                <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700">
                  <label className={`flex-1 text-center py-1.5 text-xs rounded-lg cursor-pointer transition ${
                    formData.access_type === 'paid' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                  }`}>
                    <input 
                      type="radio" 
                      name="access_type" 
                      value="paid" 
                      checked={formData.access_type === 'paid'}
                      onChange={handleChange}
                      className="hidden" 
                    /> Paid
                  </label>
                  <label className={`flex-1 text-center py-1.5 text-xs rounded-lg cursor-pointer transition ${
                    formData.access_type === 'free' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                  }`}>
                    <input 
                      type="radio" 
                      name="access_type" 
                      value="free"
                      checked={formData.access_type === 'free'}
                      onChange={handleChange}
                      className="hidden" 
                    /> Free
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">Batch Number</label>
                <input 
                  type="text" 
                  name="batch"
                  value={formData.batch}
                  onChange={handleChange}
                  placeholder="4" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">Status</label>
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">Enrollment Ends</label>
                <input 
                  type="date" 
                  name="enrollment_ends"
                  value={formData.enrollment_ends}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">Class Starts</label>
                <input 
                  type="date" 
                  name="class_starts"
                  value={formData.class_starts}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-2">Class Days</label>
              <div className="flex flex-wrap gap-2">
                {weekDays.map(day => (
                  <label key={day} className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer transition ${
                    selectedDays.includes(day) 
                      ? 'bg-emerald-600 text-white border-emerald-600' 
                      : 'bg-slate-900 border border-slate-700 hover:border-emerald-500'
                  }`}>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={selectedDays.includes(day)}
                      onChange={() => toggleDay(day)}
                    /> {day}
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    if (selectedDays.length === weekDays.length) {
                      setSelectedDays([]);
                      setFormData(prev => ({ ...prev, selected_days: [] }));
                    } else {
                      setSelectedDays(weekDays);
                      setFormData(prev => ({ ...prev, selected_days: weekDays }));
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs cursor-pointer transition bg-slate-700 text-slate-300 hover:bg-slate-600"
                >
                  {selectedDays.length === weekDays.length ? 'Uncheck All' : 'Check All'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-4 h-4 text-emerald-600 bg-slate-900 border-slate-700 rounded focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-300">Featured Course</span>
              </label>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="glass-card p-6 rounded-3xl border-emerald-500/20 bg-emerald-500/5 space-y-4" style={{
            background: 'rgba(16, 185, 129, 0.05)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <h3 className="text-lg font-medium text-emerald-400">Pricing (TK)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Current Price</label>
                <input 
                  type="number" 
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="12000" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Original Price</label>
                <input 
                  type="number" 
                  name="old_price"
                  value={formData.old_price}
                  onChange={handleChange}
                  placeholder="8500" 
                  className="w-full bg-slate-900 border border-emerald-900/50 rounded-xl px-4 py-2 outline-none focus:border-emerald-500"
                />
              </div>
              
              {formData.price && formData.old_price && (
                <div className="bg-red-950/40 text-red-500 text-[10px] font-black px-2 py-0.5 rounded border border-red-900/30 text-center">
                  {Math.round(((parseFloat(formData.old_price as string) - parseFloat(formData.price as string)) / parseFloat(formData.old_price as string)) * 100)}% OFF
                </div>
              )}
            </div>
          </div>
        </section>
        
      </form>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-end gap-3">
        <button 
          onClick={onClose}
          className="px-8 py-3 rounded-lg border border-slate-700 hover:bg-slate-800 transition text-white font-medium"
        >
          Cancel
        </button>
        <button 
          form="courseForm" 
          type="submit" 
          disabled={loading}
          className="px-8 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition shadow-lg shadow-emerald-900/20 disabled:opacity-50"
        >
          {loading ? 'Launching...' : 'Launch Course'}
        </button>
      </div>
    </div>
  );
}
