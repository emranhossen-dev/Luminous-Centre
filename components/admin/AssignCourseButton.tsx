"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserCheck, X, Loader2, BookOpen } from 'lucide-react';
import Swal from 'sweetalert2';

interface Course {
  id: number;
  title: string;
  price: number;
  category?: string;
  batch?: string;
}

interface AssignCourseButtonProps {
  userId: number;
  studentName: string;
  buttonText?: string;
  className?: string;
  showIcon?: boolean;
}

export default function AssignCourseButton({
  userId,
  studentName,
  buttonText = "Assign Course",
  className = "bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center justify-center rounded-lg text-sm font-medium h-9 px-3 transition-colors",
  showIcon = true
}: AssignCourseButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [submitting, setSubmitting] = useState(false);

  const handleOpenModal = async () => {
    setIsOpen(true);
    setLoadingCourses(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      } else {
        console.error('Failed to fetch courses:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const courseIdVal = e.target.value;
    setSelectedCourseId(courseIdVal);
    const selectedCourse = courses.find(c => c.id === parseInt(courseIdVal));
    if (selectedCourse) {
      setAmount(selectedCourse.price ? selectedCourse.price.toString() : '0');
    } else {
      setAmount('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please select a course'
      });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userId,
          courseId: parseInt(selectedCourseId),
          amount: amount ? parseFloat(amount) : undefined,
          paymentMethod: paymentMethod
        })
      });

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Enrolled Successfully',
          text: `Successfully enrolled ${studentName} in the course! 🚀`,
          confirmButtonColor: '#2563eb'
        });
        setIsOpen(false);
        setSelectedCourseId('');
        setAmount('');
        setPaymentMethod('cash');
        router.refresh();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Enrollment Failed',
          text: data.error || 'Failed to assign course'
        });
      }
    } catch (error) {
      console.error('Assign course error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while enrolling the student'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button onClick={handleOpenModal} className={className} title={buttonText}>
        {showIcon && <UserCheck className="w-4 h-4 mr-1.5" />}
        {buttonText}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/5">
              <div>
                <h2 className="text-xl font-bold text-white">Enroll in Course</h2>
                <p className="text-xs text-slate-400 mt-1">Directly enroll student: <strong className="text-blue-400">{studentName}</strong></p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Select Course <span className="text-red-500">*</span>
                </label>
                {loadingCourses ? (
                  <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    Loading available courses...
                  </div>
                ) : (
                  <select
                    value={selectedCourseId}
                    onChange={handleCourseChange}
                    required
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 text-sm"
                  >
                    <option value="">Select a course...</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.title} ({course.price || 'Free'} BDT)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Course Price / Paid Amount (BDT)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 text-sm"
                >
                  <option value="cash">Cash / Direct</option>
                  <option value="bkash">bKash</option>
                  <option value="rocket">Rocket</option>
                  <option value="nagad">Nagad</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="free">Free / Waiver</option>
                </select>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-6">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-colors text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedCourseId}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed rounded-xl text-white transition-colors text-sm font-semibold flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Assign Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
