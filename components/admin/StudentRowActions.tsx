"use client";

import React, { useState } from 'react';
import { Eye, Edit2, Trash2, GraduationCap, BookOpen, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { deleteStudent, updateStudent, assignMentor } from '@/app/admin/students/actions';

interface Mentor {
  id: string;
  name: string;
}

interface Student {
  id: string; // UUID
  user_id?: number; // Integer User ID
  name: string;
  email: string;
  phone?: string;
  status: string;
  department?: string;
  designation?: string;
  mentor_id?: string;
  mentor_name?: string;
}

interface StudentRowActionsProps {
  student: Student;
  allMentors: Mentor[];
  showViewButton?: boolean;
}

export default function StudentRowActions({
  student,
  allMentors,
  showViewButton = true
}: StudentRowActionsProps) {
  // Modal states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [isCourseOpen, setIsCourseOpen] = useState(false);

  // Edit form states
  const [editName, setEditName] = useState(student.name);
  const [editEmail, setEditEmail] = useState(student.email);
  const [editPhone, setEditPhone] = useState(student.phone || '');
  const [editStatus, setEditStatus] = useState(student.status || 'active');
  const [editDept, setEditDept] = useState(student.department || '');
  const [editDesg, setEditDesg] = useState(student.designation || '');
  const [editMentorId, setEditMentorId] = useState(student.mentor_id || '');
  const [savingEdit, setSavingEdit] = useState(false);

  // Assign Mentor state
  const [selectedMentorId, setSelectedMentorId] = useState(student.mentor_id || '');
  const [savingMentor, setSavingMentor] = useState(false);

  // Assign Course states
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [courseAmount, setCourseAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [submittingCourse, setSubmittingCourse] = useState(false);

  // 1. Delete student
  const handleDelete = async () => {
    if (!student.user_id) {
      Swal.fire('Error', 'This student has no associated user account to delete.', 'error');
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to permanently delete student "${student.name}"? This will delete their user record, enrollments, and all active logs.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Yes, delete student!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: 'Deleting...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      try {
        const res = await deleteStudent(student.user_id);
        if (res.success) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Student has been successfully deleted.',
            timer: 1500,
            showConfirmButton: false
          });
        } else {
          Swal.fire('Error!', res.error || 'Failed to delete student.', 'error');
        }
      } catch (err: any) {
        Swal.fire('Error!', err.message || 'An unexpected error occurred.', 'error');
      }
    }
  };

  // 2. Save Edit student
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student.user_id) return;

    setSavingEdit(true);
    try {
      const res = await updateStudent(student.user_id, {
        name: editName,
        email: editEmail,
        phone: editPhone || null,
        status: editStatus,
        department: editDept || null,
        designation: editDesg || null,
        mentorId: editMentorId || null
      });

      if (res.success) {
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Student information updated successfully.',
          timer: 1500,
          showConfirmButton: false
        });
        setIsEditOpen(false);
      } else {
        Swal.fire('Error!', res.error || 'Failed to update student details.', 'error');
      }
    } catch (err: any) {
      Swal.fire('Error!', err.message || 'An unexpected error occurred.', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  // 3. Assign Mentor
  const handleMentorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMentor(true);
    try {
      const res = await assignMentor(student.id, selectedMentorId || null);
      if (res.success) {
        Swal.fire({
          icon: 'success',
          title: 'Mentor Assigned!',
          text: 'Assigned mentor updated successfully.',
          timer: 1500,
          showConfirmButton: false
        });
        setIsMentorOpen(false);
      } else {
        Swal.fire('Error!', res.error || 'Failed to assign mentor.', 'error');
      }
    } catch (err: any) {
      Swal.fire('Error!', err.message || 'An unexpected error occurred.', 'error');
    } finally {
      setSavingMentor(false);
    }
  };

  // 4. Open course modal and fetch courses
  const handleOpenCourseModal = async () => {
    setIsCourseOpen(true);
    setLoadingCourses(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
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
      setCourseAmount(selectedCourse.price ? selectedCourse.price.toString() : '0');
    } else {
      setCourseAmount('');
    }
  };

  // 5. Assign course submit
  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student.user_id || !selectedCourseId) return;

    setSubmittingCourse(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: student.user_id,
          courseId: parseInt(selectedCourseId),
          amount: courseAmount ? parseFloat(courseAmount) : undefined,
          paymentMethod: paymentMethod
        })
      });

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Course Assigned!',
          text: `Enrolled successfully in the course! 🚀`,
          confirmButtonColor: '#2563eb'
        });
        setIsCourseOpen(false);
        setSelectedCourseId('');
        setCourseAmount('');
        setPaymentMethod('cash');
      } else {
        Swal.fire('Error!', data.error || 'Failed to assign course.', 'error');
      }
    } catch (error: any) {
      Swal.fire('Error!', error.message || 'An unexpected error occurred.', 'error');
    } finally {
      setSubmittingCourse(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {/* 1. Assign Course Button */}
      {student.user_id && (
        <button
          onClick={handleOpenCourseModal}
          className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-white/5 rounded-lg transition-all"
          title="Assign Course"
        >
          <BookOpen className="w-4 h-4" />
        </button>
      )}

      {/* 2. Assign Mentor Button */}
      <button
        onClick={() => setIsMentorOpen(true)}
        className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-white/5 rounded-lg transition-all"
        title="Assign Mentor"
      >
        <GraduationCap className="w-4 h-4" />
      </button>

      {/* 3. View Button */}
      {showViewButton && (
        <Link
          href={`/admin/students/${student.id}`}
          className="p-2 text-slate-400 hover:text-blue-400 hover:bg-white/5 rounded-lg transition-all"
          title="View Details"
        >
          <Eye className="w-4 h-4" />
        </Link>
      )}

      {/* 4. Edit Button */}
      {student.user_id && (
        <button
          onClick={() => setIsEditOpen(true)}
          className="p-2 text-slate-400 hover:text-amber-400 hover:bg-white/5 rounded-lg transition-all"
          title="Edit Student"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      )}

      {/* 5. Delete Button */}
      {student.user_id && (
        <button
          onClick={handleDelete}
          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-white/5 rounded-lg transition-all"
          title="Delete Student"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {/* --- Edit Student Modal --- */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-left">
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">Edit Student Details</h2>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Department</label>
                  <input
                    type="text"
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Designation</label>
                  <input
                    type="text"
                    value={editDesg}
                    onChange={(e) => setEditDesg(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Assigned Mentor</label>
                  <select
                    value={editMentorId}
                    onChange={(e) => setEditMentorId(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500 text-sm"
                  >
                    <option value="">Unassigned</option>
                    {allMentors.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 transition-colors text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed rounded-xl text-white transition-colors text-sm font-semibold flex items-center gap-1.5"
                >
                  {savingEdit && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Assign Mentor Modal --- */}
      {isMentorOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-left">
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">Assign Mentor</h2>
              <button
                onClick={() => setIsMentorOpen(false)}
                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleMentorSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Mentor</label>
                <select
                  value={selectedMentorId}
                  onChange={(e) => setSelectedMentorId(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 text-sm"
                >
                  <option value="">Unassigned</option>
                  {allMentors.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-6">
                <button
                  type="button"
                  onClick={() => setIsMentorOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 transition-colors text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingMentor}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed rounded-xl text-white transition-colors text-sm font-semibold flex items-center gap-1.5"
                >
                  {savingMentor && <Loader2 className="w-4 h-4 animate-spin" />}
                  Assign Mentor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Assign Course Modal --- */}
      {isCourseOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-left">
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/5">
              <div>
                <h2 className="text-xl font-bold text-white">Enroll in Course</h2>
                <p className="text-xs text-slate-400 mt-1">Directly enroll student: <strong className="text-blue-400">{student.name}</strong></p>
              </div>
              <button
                onClick={() => setIsCourseOpen(false)}
                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCourseSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Course <span className="text-red-500">*</span></label>
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
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Paid Amount (BDT)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={courseAmount}
                  onChange={(e) => setCourseAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Method</label>
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

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCourseOpen(false)}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 transition-colors text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCourse || !selectedCourseId}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed rounded-xl text-white transition-colors text-sm font-semibold flex items-center gap-1.5"
                >
                  {submittingCourse && <Loader2 className="w-4 h-4 animate-spin" />}
                  Assign Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
