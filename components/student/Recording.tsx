"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, Clock, Calendar, Download, Search, X, BookOpen, ChevronDown, ChevronRight } from 'lucide-react';

interface Recording {
  id: number;
  title: string;
  courseTitle: string;
  courseId: number;
  instructor: string;
  recordedAt: string;
  duration: string;
  thumbnailUrl?: string;
  videoUrl: string;
  downloadUrl?: string;
  views: number;
}

interface CourseGroup {
  courseTitle: string;
  courseId: number;
  instructor: string;
  recordings: Recording[];
}

function VideoModal({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isSecureStream = url.startsWith('/api/videos/stream/');

  const getEmbedUrl = (rawUrl: string) => {
    const ytMatch = rawUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
    const vimeoMatch = rawUrl.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    return null;
  };

  const embedUrl = !isSecureStream ? getEmbedUrl(url) : null;

  const buildSecureUrl = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    return `${url}?token=${encodeURIComponent(token || '')}`;
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 200 }}
        className="relative w-full max-w-4xl bg-[#0a0f1a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
              <PlayCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-sm font-bold text-white truncate max-w-md">{title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="aspect-video w-full bg-black">
          {isSecureStream ? (
            <video ref={videoRef} src={buildSecureUrl()} controls autoPlay className="w-full h-full" controlsList="nodownload" />
          ) : embedUrl ? (
            <iframe src={embedUrl} className="w-full h-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
              <PlayCircle className="w-12 h-12 text-slate-600" />
              <p className="text-slate-500 text-sm">Cannot embed this video directly.</p>
              <a href={url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition">
                Open in new tab
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function Recording() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activeVideoTitle, setActiveVideoTitle] = useState<string>('');
  const [expandedCourses, setExpandedCourses] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchRecordings();
  }, []);

  async function fetchRecordings() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/student/recordings', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const recs: Recording[] = data.recordings || [];
        setRecordings(recs);
        const defaultExpanded: Record<number, boolean> = {};
        recs.forEach(r => { defaultExpanded[r.courseId] = true; });
        setExpandedCourses(defaultExpanded);
      }
    } catch (error) {
      console.error('Failed to fetch recordings:', error);
    } finally {
      setLoading(false);
    }
  }

  const grouped: CourseGroup[] = [];
  const courseMap: Record<number, CourseGroup> = {};
  recordings.forEach(rec => {
    if (!courseMap[rec.courseId]) {
      courseMap[rec.courseId] = { courseTitle: rec.courseTitle, courseId: rec.courseId, instructor: rec.instructor, recordings: [] };
      grouped.push(courseMap[rec.courseId]);
    }
    courseMap[rec.courseId].recordings.push(rec);
  });

  const filteredGrouped = grouped.map(group => ({
    ...group,
    recordings: group.recordings.filter(r =>
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter(g => g.recordings.length > 0);

  const toggleCourse = (courseId: number) => {
    setExpandedCourses(prev => ({ ...prev, [courseId]: !prev[courseId] }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 mt-4">Loading recordings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activeVideoUrl && (
        <VideoModal url={activeVideoUrl} title={activeVideoTitle} onClose={() => { setActiveVideoUrl(null); setActiveVideoTitle(''); }} />
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-1">Class Recordings</h1>
        <p className="text-slate-400">Watch recorded sessions from your enrolled courses, organized by class.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input
          type="text"
          placeholder="Search by class title or course name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-slate-900/70 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm"
        />
      </div>

      {filteredGrouped.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 rounded-3xl border-2 border-dashed border-white/5">
          <PlayCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No recordings found</h3>
          <p className="text-slate-500">{searchTerm ? 'Try adjusting your search' : 'Recordings will appear here once classes are completed'}</p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredGrouped.map((group) => (
            <motion.div key={group.courseId} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden">
              <button onClick={() => toggleCourse(group.courseId)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600/15 border border-emerald-500/25 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-bold text-sm">{group.courseTitle}</p>
                    <p className="text-slate-500 text-xs">by {group.instructor || 'Mentor'} &middot; {group.recordings.length} class{group.recordings.length !== 1 ? 'es' : ''}</p>
                  </div>
                </div>
                {expandedCourses[group.courseId] ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
              </button>

              <AnimatePresence>
                {expandedCourses[group.courseId] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden border-t border-white/5"
                  >
                    <div className="divide-y divide-white/5">
                      {group.recordings.map((recording, idx) => (
                        <div key={recording.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition group">
                          <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-800 border border-white/8 flex items-center justify-center text-xs font-black text-slate-300">
                            {idx + 1}
                          </div>
                          <div
                            className="shrink-0 relative w-20 h-14 rounded-lg overflow-hidden bg-slate-800 cursor-pointer"
                            onClick={() => { setActiveVideoUrl(recording.videoUrl); setActiveVideoTitle(recording.title); }}
                          >
                            {recording.thumbnailUrl ? (
                              <img src={recording.thumbnailUrl} alt={recording.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><PlayCircle className="w-6 h-6 text-slate-600" /></div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <PlayCircle className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <button
                              onClick={() => { setActiveVideoUrl(recording.videoUrl); setActiveVideoTitle(recording.title); }}
                              className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors text-left w-full truncate cursor-pointer block"
                            >
                              {recording.title}
                            </button>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                              <span className="flex items-center gap-1"><Calendar size={11} />{new Date(recording.recordedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              {recording.duration && <span className="flex items-center gap-1"><Clock size={11} />{recording.duration}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => { setActiveVideoUrl(recording.videoUrl); setActiveVideoTitle(recording.title); }}
                              className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/30 text-emerald-400 hover:text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <PlayCircle size={13} /> Watch
                            </button>
                            {recording.downloadUrl && (
                              <a href={recording.downloadUrl} target="_blank" rel="noreferrer" className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-white/8 text-slate-400 hover:text-white rounded-lg transition">
                                <Download size={13} />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
