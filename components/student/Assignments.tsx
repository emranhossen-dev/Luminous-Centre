"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Clock, Calendar, CheckCircle2, AlertCircle, ExternalLink, Send, ArrowRight } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Assignment {
  id: number;
  courseId: number;
  title: string;
  description: string;
  maxMarks: number;
  dueDate: string;
  fileUrl?: string;
  courseTitle: string;
  submissionId?: number;
  submissionUrl?: string;
  studentComment?: string;
  submittedAt?: string;
  marksObtained?: number;
  mentorFeedback?: string;
  gradedAt?: string;
}

export default function Assignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  
  // Submit Form States
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [studentComment, setStudentComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  async function fetchAssignments() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/student/assignments', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments || []);
      }
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenSubmit = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionUrl(assignment.submissionUrl || '');
    setStudentComment(assignment.studentComment || '');
    setSubmitModalOpen(true);
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    if (!submissionUrl) {
      toast.error('Please enter a submission link/URL');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/student/assignments/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          assignmentId: selectedAssignment.id,
          submissionUrl,
          studentComment
        })
      });

      if (response.ok) {
        toast.success(selectedAssignment.submissionId ? 'Assignment resubmitted successfully! 🚀' : 'Assignment submitted successfully! 🎉');
        setSubmitModalOpen(false);
        fetchAssignments();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to submit assignment');
      }
    } catch (error) {
      console.error('Submit assignment error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 mt-4 font-semibold uppercase tracking-wider text-xs">Syncing your assignments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Assignments</h1>
        <p className="text-slate-400">View and submit homework, projects, and assignments for your active courses.</p>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 rounded-3xl border-2 border-dashed border-white/5">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No assignments found</h3>
          <p className="text-slate-500">Your mentors haven't uploaded any assignments yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {assignments.map((assignment, index) => {
            const isDueDatePassed = new Date(assignment.dueDate) < new Date();
            const isSubmitted = !!assignment.submissionId;
            const isGraded = assignment.marksObtained !== null && assignment.marksObtained !== undefined;

            return (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-900/40 border border-white/5 hover:border-emerald-500/20 rounded-2xl p-6 transition-all duration-300 relative overflow-hidden"
              >
                {/* Grading Highlight Badge */}
                {isGraded ? (
                  <div className="absolute top-0 right-0 bg-emerald-600/10 border-l border-b border-emerald-500/20 text-emerald-400 text-xs px-4 py-2 rounded-bl-xl font-bold">
                    Graded: {assignment.marksObtained} / {assignment.maxMarks}
                  </div>
                ) : isSubmitted ? (
                  <div className="absolute top-0 right-0 bg-amber-600/10 border-l border-b border-amber-500/20 text-amber-400 text-xs px-4 py-2 rounded-bl-xl font-bold">
                    Submitted
                  </div>
                ) : isDueDatePassed ? (
                  <div className="absolute top-0 right-0 bg-rose-600/10 border-l border-b border-rose-500/20 text-rose-400 text-xs px-4 py-2 rounded-bl-xl font-bold">
                    Overdue
                  </div>
                ) : null}

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
                        {assignment.courseTitle}
                      </span>
                      <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors mt-0.5">
                        {assignment.title}
                      </h3>
                    </div>

                    <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line max-w-3xl">
                      {assignment.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        Due: {new Date(assignment.dueDate).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileText size={14} />
                        Max Marks: {assignment.maxMarks}
                      </div>
                      {assignment.fileUrl && (
                        <a
                          href={assignment.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          <ExternalLink size={14} />
                          Download Materials
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[200px]">
                    {isGraded ? (
                      <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-3.5 space-y-2">
                        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                          <CheckCircle2 size={15} />
                          Submission Reviewed
                        </div>
                        {assignment.mentorFeedback && (
                          <p className="text-xs text-slate-400 italic">
                            "{assignment.mentorFeedback}"
                          </p>
                        )}
                        <p className="text-[10px] text-slate-500">
                          Reviewed on {new Date(assignment.gradedAt!).toLocaleDateString()}
                        </p>
                        <button
                          onClick={() => handleOpenSubmit(assignment)}
                          className="w-full mt-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-all"
                        >
                          View Submission
                        </button>
                      </div>
                    ) : isSubmitted ? (
                      <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-3.5 space-y-3">
                        <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                          <Clock size={15} />
                          Pending Mentor Review
                        </div>
                        <a
                          href={assignment.submissionUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs text-emerald-400 hover:underline font-semibold"
                        >
                          View My Submission <ExternalLink size={12} />
                        </a>
                        <button
                          onClick={() => handleOpenSubmit(assignment)}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
                        >
                          Resubmit Assignment
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenSubmit(assignment)}
                        disabled={isDueDatePassed}
                        className={`w-full py-3 px-4 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm ${
                          isDueDatePassed
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98]'
                        }`}
                      >
                        {isDueDatePassed ? (
                          <>
                            <AlertCircle size={16} /> Missing (Past Due)
                          </>
                        ) : (
                          <>
                            Submit Work <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      <AnimatePresence>
        {submitModalOpen && selectedAssignment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSubmitModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden z-10"
            >
              <div className="mb-4">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400">
                  {selectedAssignment.courseTitle}
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {selectedAssignment.submissionId ? 'Update Submission' : 'Submit Assignment'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Assignment: {selectedAssignment.title}
                </p>
              </div>

              <form onSubmit={handleSubmitAssignment} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                    Submission URL / Link (GitHub, Drive, etc.) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/... or Google Drive link"
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                    Comments or Notes (Optional)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Add notes for your instructor..."
                    value={studentComment}
                    onChange={(e) => setStudentComment(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none focus:border-emerald-500 transition-colors resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSubmitModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                  >
                    {submitting ? (
                      'Submitting...'
                    ) : (
                      <>
                        <Send size={14} /> Submit Assignment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
