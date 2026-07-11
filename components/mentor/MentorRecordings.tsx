"use client";

import React, { useState, useEffect } from 'react';
import { PlayCircle, Plus, Edit, Trash2, Calendar, Clock, Loader2, Save } from 'lucide-react';
import { toast } from 'react-toastify';

interface Course {
  id: number;
  title: string;
  slug: string;
}

interface Recording {
  id: number;
  courseId: number;
  courseTitle: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  downloadUrl?: string;
  duration?: string;
  recordedAt: string;
}

export default function MentorRecordings() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecording, setEditingRecording] = useState<Recording | null>(null);

  // Form States
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [recordedAt, setRecordedAt] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRecordingsAndCourses();
  }, []);

  async function fetchRecordingsAndCourses() {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch recordings
      const recResponse = await fetch('/api/mentor/recordings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (recResponse.ok) {
        const data = await recResponse.json();
        setRecordings(data.recordings || []);
      }

      // Fetch courses (to populate select dropdown)
      const courseResponse = await fetch('/api/mentor/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (courseResponse.ok) {
        const data = await courseResponse.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Failed to load recordings/courses:', error);
      toast.error('Failed to load recordings data');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAdd = () => {
    setEditingRecording(null);
    setCourseId(courses[0]?.id?.toString() || '');
    setTitle('');
    setVideoUrl('');
    setThumbnailUrl('');
    setDownloadUrl('');
    setDuration('');
    // Format current local time for datetime-local input (YYYY-MM-DDThh:mm)
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16);
    setRecordedAt(localISOTime);
    setModalOpen(true);
  };

  const handleOpenEdit = (rec: Recording) => {
    setEditingRecording(rec);
    setCourseId(rec.courseId.toString());
    setTitle(rec.title);
    setVideoUrl(rec.videoUrl);
    setThumbnailUrl(rec.thumbnailUrl || '');
    setDownloadUrl(rec.downloadUrl || '');
    setDuration(rec.duration || '');
    const localTime = new Date(rec.recordedAt);
    const offset = localTime.getTimezoneOffset() * 60000;
    const formatted = new Date(localTime.getTime() - offset).toISOString().slice(0, 16);
    setRecordedAt(formatted);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this recording?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/mentor/recordings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Recording deleted successfully');
        fetchRecordingsAndCourses();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete recording');
      }
    } catch (error) {
      console.error('Delete recording error:', error);
      toast.error('Failed to delete recording');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !title || !videoUrl) {
      toast.error('Course, Title, and Video URL are required');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const url = editingRecording 
        ? `/api/mentor/recordings/${editingRecording.id}` 
        : '/api/mentor/recordings';
      const method = editingRecording ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId: parseInt(courseId),
          title,
          videoUrl,
          thumbnailUrl,
          downloadUrl,
          duration,
          recordedAt
        })
      });

      if (response.ok) {
        toast.success(editingRecording ? 'Recording updated successfully 🎉' : 'Recording added successfully 🎉');
        setModalOpen(false);
        fetchRecordingsAndCourses();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to save recording');
      }
    } catch (error) {
      console.error('Save recording error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading class recordings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Class Recordings</h2>
          <p className="text-slate-400 font-medium">Add and manage video recordings for your assigned courses.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" /> Add Recording
        </button>
      </div>

      {recordings.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
          <PlayCircle className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">No recordings uploaded yet</h3>
          <p className="text-slate-500">Click the button above to upload your first class session recording.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recordings.map((recording) => (
            <div
              key={recording.id}
              className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 flex gap-6 hover:border-slate-700 transition"
            >
              <div className="relative w-32 h-20 bg-slate-950 rounded-xl overflow-hidden shrink-0 flex items-center justify-center border border-slate-800">
                {recording.thumbnailUrl ? (
                  <img src={recording.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                ) : (
                  <PlayCircle className="w-8 h-8 text-slate-700" />
                )}
              </div>

              <div className="flex-1 space-y-3 min-w-0">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    {recording.courseTitle}
                  </span>
                  <h3 className="text-md font-bold text-white truncate mt-0.5" title={recording.title}>
                    {recording.title}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={13} />
                    {new Date(recording.recordedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={13} />
                    {recording.duration || 'N/A'}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <a
                    href={recording.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                  >
                    Watch URL
                  </a>
                  <button
                    onClick={() => handleOpenEdit(recording)}
                    className="text-xs text-slate-400 hover:text-slate-200 font-bold flex items-center gap-1"
                  >
                    <Edit size={13} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(recording.id)}
                    className="text-xs text-red-500 hover:text-red-400 font-bold flex items-center gap-1"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setModalOpen(false)} />

          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-hidden z-10">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingRecording ? 'Edit Class Recording' : 'Add Class Recording'}
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
                  Class / Video Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Class 05: Introduction to React Routing"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                  Video URL (YouTube, Vimeo, Drive, etc.) <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                    Duration (e.g. 1h 45m)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2h 15m"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                    Recording Date/Time
                  </label>
                  <input
                    type="datetime-local"
                    value={recordedAt}
                    onChange={(e) => setRecordedAt(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                    Thumbnail URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                    Download Link (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={downloadUrl}
                    onChange={(e) => setDownloadUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-505 disabled:bg-slate-850 disabled:text-slate-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  {saving ? 'Saving...' : <><Save size={14} /> Save Recording</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
