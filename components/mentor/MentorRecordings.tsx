"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, Plus, Edit, Trash2, Calendar, Clock, Loader2, Save, Upload, BookOpen, ChevronDown, ChevronRight } from 'lucide-react';
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
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

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
    const defaultCourseId = courses[0]?.id?.toString() || '';
    setCourseId(defaultCourseId);
    
    // Auto-calculate next class number for prefilled title
    const courseRecs = recordings.filter(r => r.courseId === Number(defaultCourseId));
    const nextClassNum = courseRecs.length + 1;
    setTitle(`Class ${nextClassNum}: `);

    setVideoUrl('');
    setThumbnailUrl('');
    setDownloadUrl('');
    setDuration('');
    setUploadMode('url');
    setUploading(false);
    setUploadProgress(0);
    setUploadError(null);
    // Format current local time for datetime-local input (YYYY-MM-DDThh:mm)
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16);
    setRecordedAt(localISOTime);
    setModalOpen(true);
  };

  const handleCourseChange = (selectedId: string) => {
    setCourseId(selectedId);
    if (!editingRecording) {
      const courseRecs = recordings.filter(r => r.courseId === Number(selectedId));
      const nextClassNum = courseRecs.length + 1;
      setTitle(`Class ${nextClassNum}: `);
    }
  };

  const handleOpenEdit = (rec: Recording) => {
    setEditingRecording(rec);
    setCourseId(rec.courseId.toString());
    setTitle(rec.title);
    setVideoUrl(rec.videoUrl);
    setThumbnailUrl(rec.thumbnailUrl || '');
    setDownloadUrl(rec.downloadUrl || '');
    setDuration(rec.duration || '');
    setUploadMode(rec.videoUrl.includes('/api/videos/stream/') ? 'file' : 'url');
    setUploading(false);
    setUploadProgress(0);
    setUploadError(null);
    const localTime = new Date(rec.recordedAt);
    const offset = localTime.getTimezoneOffset() * 60000;
    const formatted = new Date(localTime.getTime() - offset).toISOString().slice(0, 16);
    setRecordedAt(formatted);
    setModalOpen(true);
  };

  const handleDirectUpload = (file: File) => {
    const allowedExtensions = ['.mp4', '.mkv', '.mov'];
    const fileName = file.name.toLowerCase();
    const lastDotIndex = fileName.lastIndexOf('.');
    const ext = lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : '';

    if (!allowedExtensions.includes(ext)) {
      toast.error(`Invalid video format "${ext}". Only mp4, mkv, and mov are allowed.`);
      return;
    }

    const MAX_SIZE = 2 * 1024 * 1024 * 1024; // 2 GB MTProto Limit
    if (file.size > MAX_SIZE) {
      toast.error('File size exceeds the 2 GB MTProto upload limit.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('video', file);
    formData.append('course_id', courseId || courses[0]?.id?.toString() || '');
    formData.append('title', title || file.name.replace(/\.[^/.]+$/, ""));

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/admin/videos/upload');
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    };

    xhr.onload = () => {
      setUploading(false);
      if (xhr.status === 200) {
        try {
          const res = JSON.parse(xhr.responseText);
          if (res.success && res.video) {
            toast.success('Video uploaded to Telegram storage successfully!');
            setVideoUrl(`/api/videos/stream/${res.video.id}`);
            if (!title) {
              setTitle(res.video.title);
            }
          } else {
            toast.error(res.error || 'Upload failed');
          }
        } catch (_) {
          toast.error('Failed parsing response');
        }
      } else {
        let errMsg = 'Upload failed.';
        try {
          const res = JSON.parse(xhr.responseText);
          if (res.error) {
            errMsg = `${res.error}${res.details ? `: ${res.details}` : ''}`;
          }
        } catch (_) {}
        toast.error(errMsg);
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      toast.error('Network error during upload.');
    };

    xhr.send(formData);
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
      ) : (() => {
        // Group by course
        const grouped: { courseTitle: string; courseId: number; items: typeof recordings }[] = [];
        const cmap: Record<number, typeof grouped[0]> = {};
        recordings.forEach(r => {
          const cid = (r as any).courseId || 0;
          if (!cmap[cid]) {
            cmap[cid] = { courseTitle: r.courseTitle, courseId: cid, items: [] };
            grouped.push(cmap[cid]);
          }
          cmap[cid].items.push(r);
        });

        return (
          <div className="space-y-5">
            {grouped.map((group) => (
              <motion.div key={group.courseId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden">
                {/* Course Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{group.courseTitle}</p>
                      <p className="text-slate-500 text-xs">{group.items.length} class{group.items.length !== 1 ? 'es' : ''} recorded</p>
                    </div>
                  </div>
                </div>

                {/* Class List */}
                <div className="divide-y divide-slate-800/50">
                  {group.items.map((recording, idx) => (
                    <div key={recording.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-800/30 transition group">
                      <div className="shrink-0 w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-slate-300">
                        {idx + 1}
                      </div>
                      <div className="relative shrink-0 w-20 h-14 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
                        {recording.thumbnailUrl ? (
                          <img src={recording.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <PlayCircle className="w-6 h-6 text-slate-700" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors" title={recording.title}>{recording.title}</h3>
                        <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-500 mt-1">
                          <span className="flex items-center gap-1"><Calendar size={11} />{new Date(recording.recordedAt).toLocaleDateString()}</span>
                          {recording.duration && <span className="flex items-center gap-1"><Clock size={11} />{recording.duration}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a href={recording.videoUrl} target="_blank" rel="noreferrer"
                          className="px-2.5 py-1.5 text-xs text-blue-400 hover:text-white hover:bg-blue-600 border border-blue-500/30 font-bold rounded-lg transition flex items-center gap-1">
                          <PlayCircle size={12} /> Preview
                        </a>
                        <button onClick={() => handleOpenEdit(recording)}
                          className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700 font-bold rounded-lg transition flex items-center gap-1">
                          <Edit size={12} /> Edit
                        </button>
                        <button onClick={() => handleDelete(recording.id)}
                          className="px-2.5 py-1.5 text-xs text-red-500 hover:text-white hover:bg-red-600 border border-red-500/30 font-bold rounded-lg transition flex items-center gap-1">
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        );
      })()}

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
                  onChange={(e) => handleCourseChange(e.target.value)}
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

              <div className="space-y-3">
                <div className="flex gap-4 border-b border-slate-800 pb-1.5">
                  <button
                    type="button"
                    onClick={() => setUploadMode('url')}
                    className={`text-xs font-bold transition cursor-pointer ${uploadMode === 'url' ? 'text-blue-400 border-b-2 border-blue-500 pb-0.5' : 'text-slate-500'}`}
                  >
                    External Video Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('file')}
                    className={`text-xs font-bold transition cursor-pointer ${uploadMode === 'file' ? 'text-blue-400 border-b-2 border-blue-500 pb-0.5' : 'text-slate-500'}`}
                  >
                    Upload Direct Video
                  </button>
                </div>

                {uploadMode === 'file' ? (
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">
                      Upload Video File (MP4, MKV, MOV - Max 50MB)
                    </label>
                    
                    {uploading ? (
                      <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>Uploading to Telegram Secure Storage...</span>
                          <span className="font-bold">{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full transition-all" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                    ) : videoUrl.includes('/api/videos/stream/') ? (
                      <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2 text-green-400 text-xs font-semibold">
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                          <span>Video uploaded successfully!</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => {
                            setVideoUrl('');
                            setUploadMode('url');
                          }}
                          className="text-xs text-red-400 hover:text-red-300 font-bold cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <label className="flex flex-col items-center justify-center border border-dashed border-slate-850 hover:border-slate-800 bg-slate-950 rounded-xl p-6 cursor-pointer group transition">
                          <Upload className="w-6 h-6 text-slate-500 group-hover:text-slate-400 mb-2" />
                          <span className="text-xs text-slate-400 group-hover:text-white font-semibold">Click to select video file</span>
                          <span className="text-[10px] text-slate-600 mt-1">Accepts MP4, MKV, MOV up to 50MB</span>
                          <input
                            type="file"
                            accept=".mp4,.mkv,.mov"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleDirectUpload(file);
                            }}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                      Video URL (YouTube, Vimeo, Drive, etc.) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      required={uploadMode === 'url'}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 outline-none focus:border-blue-500"
                    />
                  </div>
                )}
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
