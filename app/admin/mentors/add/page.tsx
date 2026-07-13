'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { createMentor } from './actions';
import { toast } from 'react-toastify';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const mentorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  designation: z.string().min(2, 'Designation is required'),
  experience: z.string().optional(),
  bio: z.string().optional(),
  skills: z.string().optional(), // Comma separated for now
  linkedin: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  github: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  status: z.enum(['active', 'suspended', 'inactive']),
});

type MentorFormValues = z.infer<typeof mentorSchema>;

export default function AddMentorPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courses, setCourses] = useState<{ id: number; title: string }[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('/api/admin/courses?limit=100', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setCourses(data.courses || []);
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      }
    };
    fetchCourses();
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<MentorFormValues>({
    resolver: zodResolver(mentorSchema),
    defaultValues: {
      status: 'active'
    }
  });

  const onSubmit = async (data: MentorFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await createMentor({
        ...data,
        assignedCourseIds: selectedCourseIds
      });
      if (result.success) {
        toast.success('Mentor created successfully!');
        router.push('/admin/mentors');
      } else {
        toast.error(result.error || 'Failed to create mentor');
      }
    } catch (err: any) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Add New Mentor</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Full Name *</label>
            <input 
              {...register('name')} 
              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              placeholder="John Doe"
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Email Address *</label>
            <input 
              {...register('email')} 
              type="email"
              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              placeholder="john@example.com"
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Password *</label>
            <input 
              {...register('password')} 
              type="password"
              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Phone Number</label>
            <input 
              {...register('phone')} 
              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              placeholder="+1234567890"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Status *</label>
            <select 
              {...register('status')}
              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-slate-100"
            >
              <option value="active" className="dark:bg-slate-900">Active</option>
              <option value="suspended" className="dark:bg-slate-900">Suspended</option>
              <option value="inactive" className="dark:bg-slate-900">Inactive</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Designation *</label>
            <input 
              {...register('designation')} 
              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              placeholder="Senior Software Engineer"
            />
            {errors.designation && <p className="text-sm text-red-500">{errors.designation.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Experience</label>
            <input 
              {...register('experience')} 
              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              placeholder="e.g., 5 Years"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Skills (Comma separated)</label>
            <input 
              {...register('skills')} 
              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              placeholder="React, Node.js, Python"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Assign Courses to Mentor</label>
          {courses.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-slate-400">Loading active courses...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto border border-gray-300 dark:border-slate-800 rounded-lg p-4 bg-transparent dark:bg-slate-950">
              {courses.map(course => (
                <label key={course.id} className="flex items-center gap-3 text-sm text-gray-755 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCourseIds.includes(course.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCourseIds([...selectedCourseIds, course.id]);
                      } else {
                        setSelectedCourseIds(selectedCourseIds.filter(id => id !== course.id));
                      }
                    }}
                    className="rounded border-gray-300 dark:border-slate-800 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{course.title}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Biography</label>
          <textarea 
            {...register('bio')} 
            rows={4}
            className="flex w-full rounded-md border border-gray-300 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            placeholder="Write a short bio about the mentor..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">LinkedIn URL</label>
            <input 
              {...register('linkedin')} 
              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              placeholder="https://linkedin.com/in/..."
            />
            {errors.linkedin && <p className="text-sm text-red-500">{errors.linkedin.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">GitHub URL</label>
            <input 
              {...register('github')} 
              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              placeholder="https://github.com/..."
            />
            {errors.github && <p className="text-sm text-red-500">{errors.github.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Website URL</label>
            <input 
              {...register('website')} 
              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              placeholder="https://..."
            />
            {errors.website && <p className="text-sm text-red-500">{errors.website.message}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-4 border-t border-gray-100 dark:border-slate-800 pt-6">
          <Link 
            href="/admin/mentors"
            className="h-10 px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-md text-sm font-medium transition-colors"
          >
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="h-10 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors inline-flex items-center shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Mentor
          </button>
        </div>
      </form>
    </div>
  );
}
