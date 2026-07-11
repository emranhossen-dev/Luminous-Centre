"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit, Trash2, Calendar, Award, CheckCircle2, AlertCircle, ExternalLink, ArrowLeft, Loader2, Save } from 'lucide-react';
import { toast } from 'react-toastify';

interface Course {
  id: number;
  title: string;
  slug: string;
}

interface Assignment {
  id: number;
  courseId: number;
  courseTitle: string;
  title: string;
  description: string;
  maxMarks: number;
  dueDate: string;
  fileUrl?: string;
  submissionsCount: number;
  gradedCount: number;
}

interface Submission {
  id: number;
  assignmentId: number;
  userId: number;
  submissionUrl: string;
  studentComment?: string;
  submittedAt: string;
  marksObtained?: number;
  mentorFeedback?: string;
  gradedAt?: string;
  firstName: string;
  lastName: string;
  email: string;
  assignmentTitle: string;
  maxMarks: number;
}

export default function MentorAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  // Submissions View States
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  // Assignment Form States
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxMarks, setMaxMarks] = useState('100');
  const [dueDate, setDueDate] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [saving, setSaving] = useState(false);

  // Grading Form States
  const [marksObtained, setMarksObtained] = useState('');
  const [mentorFeedback, setMentorFeedback] = useState('');
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    fetchAssignmentsAndCourses();
  }, []);

  async function fetchAssignmentsAndCourses() {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const assResponse = await fetch('/api/mentor/assignments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (assResponse.ok) {
        const data = await assResponse.json();
        setAssignments(data.assignments || []);
      }

      const courseResponse = await fetch('/api/mentor/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (courseResponse.ok) {
        const data = await courseResponse.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Failed to load assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }

  const fetchSubmissions = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setLoadingSubmissions(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/mentor/assignments/submissions?assignmentId=${assignment.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions || []);
      } else {
        toast.error('Failed to fetch student submissions');
      }
    } catch (error) {
      console.error('Fetch submissions error:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingAssignment(null);
    setCourseId(courses[0]?.id?.toString() || '');
    setTitle('');
    setDescription('');
    setMaxMarks('100');
    // Format tomorrow for due date input (YYYY-MM-DDThh:mm)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7);
    const offset = tomorrow.getTimezoneOffset() * 60000;
    const tomorrowISOTime = new Date(tomorrow.getTime() - offset).toISOString().slice(0, 16);
    setDueDate(tomorrowISOTime);
    setFileUrl('');
    setModalOpen(true);
  };

  const handleOpenEdit = (ass: Assignment) => {
    setEditingAssignment(ass);
    setCourseId(ass.courseId.toString());
    setTitle(ass.title);
    setDescription(ass.description || '');
    setMaxMarks(ass.maxMarks.toString());
    
    const localTime = new Date(ass.dueDate);
    const offset = localTime.getTimezoneOffset() * 60000;
    const formatted = new Date(localTime.getTime() - offset).toISOString().slice(0, 16);
    setDueDate(formatted);
    setFileUrl(ass.fileUrl || '');
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/mentor/assignments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Assignment deleted successfully');
        fetchAssignmentsAndCourses();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete assignment');
      }
    } catch (error) {
      console.error('Delete assignment error:', error);
      toast.error('Failed to delete assignment');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !title || !dueDate) {
      toast.error('Course, Title, and Due Date are required');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const url = editingAssignment 
        ? `/api/mentor/assignments/${editingAssignment.id}` 
        : '/api/mentor/assignments';
      const method = editingAssignment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId: parseInt(courseId),
          title,
          description,
          maxMarks: parseFloat(maxMarks),
          dueDate,
          fileUrl
        })
      });

      if (response.ok) {
        toast.success(editingAssignment ? 'Assignment updated successfully 🎉' : 'Assignment created successfully 🎉');
        setModalOpen(false);
        fetchAssignmentsAndCourses();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to save assignment');
      }
    } catch (error) {
      console.error('Save assignment error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenGrade = (sub: Submission) => {
    setSelectedSubmission(sub);
    setMarksObtained(sub.marksObtained !== undefined && sub.marksObtained !== null ? sub.marksObtained.toString() : '');
    setMentorFeedback(sub.mentorFeedback || '');
    setGradeModalOpen(true);
  };

  const handleSubmitGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    
    const marksNum = parseFloat(marksObtained);
    if (isNaN(marksNum) || marksNum < 0 || marksNum > selectedSubmission.maxMarks) {
      toast.error(`Marks must be between 0 and ${selectedSubmission.maxMarks}`);
      return;
    }

    setGrading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/mentor/assignments/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          marksObtained: marksNum,
          mentorFeedback
        })
      });

      if (response.ok) {
        toast.success('Submission graded successfully 🎉');
        setGradeModalOpen(false);
        // Refresh submissions and assignments list
        if (selectedAssignment) {
          fetchSubmissions(selectedAssignment);
        }
        fetchAssignmentsAndCourses();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to grade submission');
      }
    } catch (error) {
      console.error('Grade submission error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setGrading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading assignments data...</p>
      </div>
    );
  }

  // --- SUBMISSIONS VIEW SUB-PANEL ---
  if (selectedAssignment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedAssignment(null)}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              {selectedAssignment.courseTitle}
            </span>
            <h2 className="text-2xl font-black text-white mt-0.5">
              Submissions: {selectedAssignment.title}
            </h2>
          </div>
        </div>

        {loadingSubmissions ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-slate-400 text-xs">Syncing student submissions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
            <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">No submissions yet</h3>
            <p className="text-slate-500">Students have not submitted their work for this assignment yet.</p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 bg-slate-950/20 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Submitted Work</th>
                    <th className="px-6 py-4">Comment</th>
                    <th className="px-6 py-4">Submitted Date</th>
                    <th className="px-6 py-4">Grade</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-sm text-slate-300">
                  {submissions.map((sub) => {
                    const isGraded = sub.marksObtained !== null && sub.marksObtained !== undefined;
                    return (
                      <tr key={sub.id} className="hover:bg-slate-950/10">
                        <td className="px-6 py-4">
                          <div className="font-bold text-white">{sub.firstName} {sub.lastName}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{sub.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <a
                            href={sub.submissionUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1 hover:underline"
                          >
                            Open Link <ExternalLink size={12} />
                          </a>
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate" title={sub.studentComment}>
                          {sub.studentComment || <span className="text-slate-600">None</span>}
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-400">
                          {new Date(sub.submittedAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          {isGraded ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold">
                              {sub.marksObtained} / {sub.maxMarks}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-600/10 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-bold">
                              Pending Review
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleOpenGrade(sub)}
                            className="bg-slate-800 hover:bg-blue-900/30 border border-slate-700/50 hover:border-blue-500/30 text-slate-300 hover:text-blue-400 text-xs font-bold py-1.5 px-3 rounded-lg transition"
                          >
                            {isGraded ? 'Update Grade' : 'Grade Submission'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Grading Modal */}
        {gradeModalOpen && selectedSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setGradeModalOpen(false)} />
            
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-hidden z-10">
              <h3 className="text-xl font-bold text-white mb-2">Grade Assignment</h3>
              <p className="text-xs text-slate-500 mb-4">
                Student: {selectedSubmission.firstName} {selectedSubmission.lastName}
              </p>

              <form onSubmit={handleSubmitGrade} className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl space-y-2 border border-slate-850">
                  <div className="text-xs text-slate-400">
                    <span className="font-bold text-slate-200">Submitted Link:</span>{' '}
                    <a href={selectedSubmission.submissionUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-0.5">
                      Open <ExternalLink size={10} />
                    </a>
                  </div>
                  {selectedSubmission.studentComment && (
                    <div className="text-xs text-slate-400">
                      <span className="font-bold text-slate-200">Student Comment:</span>{' '}
                      <p className="italic mt-1 text-slate-300">"{selectedSubmission.studentComment}"</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                    Marks Obtained (Max: {selectedSubmission.maxMarks}) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max={selectedSubmission.maxMarks}
                    placeholder={`0 - ${selectedSubmission.maxMarks}`}
                    value={marksObtained}
                    onChange={(e) => setMarksObtained(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                    Feedback for Student
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter feedback or tips for improvement..."
                    value={mentorFeedback}
                    onChange={(e) => setMentorFeedback(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setGradeModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={grading}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-505 disabled:bg-slate-850 disabled:text-slate-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                  >
                    {grading ? 'Saving...' : <><Save size={14} /> Submit Grade</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- GENERAL ASSIGNMENTS LIST VIEW ---
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Assignments</h2>
          <p className="text-slate-400 font-medium">Create homework tasks, grade solutions, and monitor student submissions.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" /> Add Assignment
        </button>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
          <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">No assignments created yet</h3>
          <p className="text-slate-500">Click the button above to assign homework to your students.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {assignments.map((assignment) => {
            const hasSubmissions = assignment.submissionsCount > 0;
            const isFullyGraded = hasSubmissions && assignment.submissionsCount === assignment.gradedCount;

            return (
              <div
                key={assignment.id}
                className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 flex flex-col lg:flex-row justify-between lg:items-center gap-6 hover:border-slate-700 transition"
              >
                <div className="space-y-2.5 flex-1 min-w-0">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      {assignment.courseTitle}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-0.5 truncate" title={assignment.title}>
                      {assignment.title}
                    </h3>
                  </div>

                  <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line max-w-4xl truncate" title={assignment.description}>
                    {assignment.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      Due: {new Date(assignment.dueDate).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award size={14} />
                      Max Marks: {assignment.maxMarks}
                    </div>
                    {assignment.fileUrl && (
                      <a
                        href={assignment.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 hover:underline flex items-center gap-1"
                      >
                        Material Link <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[220px]">
                  <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-3.5 space-y-2 text-center lg:text-left">
                    <div className="text-xs font-bold text-slate-400">
                      Submissions: <span className="text-white">{assignment.submissionsCount}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-400">
                      Graded:{' '}
                      <span className={isFullyGraded ? 'text-emerald-400' : 'text-amber-400'}>
                        {assignment.gradedCount} / {assignment.submissionsCount}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => fetchSubmissions(assignment)}
                      className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all"
                    >
                      View Submissions
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(assignment)}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1"
                    >
                      <Edit size={13} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(assignment.id)}
                      className="flex-1 py-2 bg-slate-800/80 hover:bg-red-950/30 text-red-500 hover:text-red-400 border border-transparent hover:border-red-900/30 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setModalOpen(false)} />

          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-hidden z-10">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingAssignment ? 'Edit Homework Assignment' : 'Assign Homework'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                  Select Course <span className="text-red-500">*</span>
                </label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500"
                >
                  <option value="" disabled>Choose a course...</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                  Assignment Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Homework 02: Building a Responsive Navbar with HTML/CSS"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                  Task Description / Instructions
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter detailed assignment guidelines..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                    Max Marks <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 100"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                    Due Date/Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                  Attachment Link (Google Drive doc, PDF instruction URL, etc.)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-855 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-505 disabled:bg-slate-850 disabled:text-slate-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  {saving ? 'Saving...' : <><Save size={14} /> Assign Task</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
