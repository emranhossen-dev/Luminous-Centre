"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  ChevronLeft, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Clock, 
  Award,
  Video,
  FileText,
  Volume2,
  Maximize,
  CheckCircle,
  PlayCircle
} from 'lucide-react';

interface VideoData {
  id: number;
  title: string;
  duration?: string;
  created_at?: string;
}

interface TopicData {
  id: number;
  topic_name: string;
  order_index: number;
  videos: VideoData[];
}

interface ModuleData {
  id: number;
  title: string;
  order_index: number;
  topics: TopicData[];
}

interface CoursePlayerProps {
  courseId: number;
  courseTitle: string;
  onBack: () => void;
}

export default function CoursePlayer({ courseId, courseTitle, onBack }: CoursePlayerProps) {
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});
  const [activeVideo, setActiveVideo] = useState<VideoData | null>(null);
  const [videoToken, setVideoToken] = useState<string>('');

  useEffect(() => {
    // Set authentication token for secure stream
    if (typeof window !== 'undefined') {
      setVideoToken(localStorage.getItem('token') || '');
    }
    fetchCurriculum();
  }, [courseId]);

  async function fetchCurriculum() {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/courses/${courseId}/curriculum`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to load course modules');
      }

      const data = await response.json();
      const fetchedModules = data.modules || [];
      setModules(fetchedModules);

      // Expand the first module by default
      if (fetchedModules.length > 0) {
        setExpandedModules({ [fetchedModules[0].id]: true });
        
        // Find the first available video to play by default
        let firstVideo: VideoData | null = null;
        for (const mod of fetchedModules) {
          for (const topic of mod.topics) {
            if (topic.videos && topic.videos.length > 0) {
              firstVideo = topic.videos[0];
              break;
            }
          }
          if (firstVideo) break;
        }
        if (firstVideo) {
          setActiveVideo(firstVideo);
        }
      }
    } catch (err: any) {
      console.error('Failed to load curriculum:', err);
      setError(err.message || 'Failed to load curriculum');
    } finally {
      setLoading(false);
    }
  }

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const getSecureStreamUrl = (videoId: number) => {
    return `/api/videos/stream/${videoId}?token=${encodeURIComponent(videoToken)}`;
  };

  return (
    <div className="min-h-[85vh] bg-[#020617] rounded-3xl border border-white/5 overflow-hidden flex flex-col lg:flex-row shadow-2xl">
      {/* Sidebar Panel - Course Navigation */}
      <div className="w-full lg:w-96 border-r border-white/5 bg-slate-950/60 flex flex-col shrink-0">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-widest">COURSE PLAYER</h2>
            <h1 className="text-base font-bold text-white truncate" title={courseTitle}>
              {courseTitle}
            </h1>
          </div>
        </div>

        {/* Modules List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
              <p className="text-slate-500 text-xs mt-3">Loading course modules...</p>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-rose-500 text-sm">{error}</div>
          ) : modules.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">
              No lessons have been uploaded for this course yet.
            </div>
          ) : (
            modules.map((mod, index) => {
              const isExpanded = !!expandedModules[mod.id];
              return (
                <div key={mod.id} className="bg-slate-900/30 rounded-2xl border border-white/5 overflow-hidden">
                  {/* Module Toggle Button */}
                  <button 
                    onClick={() => toggleModule(mod.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-all text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3 pr-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <span className="text-xs font-black text-emerald-400">{(index + 1).toString().padStart(2, '0')}</span>
                      </div>
                      <span className="text-sm font-bold text-white truncate">{mod.title}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown size={16} className="text-slate-500 shrink-0" />
                    )}
                  </button>

                  {/* Topics List */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-white/5 bg-slate-950/20"
                      >
                        <div className="p-2 space-y-2">
                          {mod.topics.length === 0 ? (
                            <p className="text-xs text-slate-500 p-3 italic">No topics inside this module.</p>
                          ) : (
                            mod.topics.map((topic) => (
                              <div key={topic.id} className="space-y-1">
                                <div className="px-3 py-1.5 text-xs font-bold text-slate-500 tracking-wider flex items-center gap-1.5 uppercase">
                                  <BookOpen size={12} />
                                  <span>{topic.topic_name}</span>
                                </div>
                                <div className="space-y-1 pl-2">
                                  {topic.videos && topic.videos.map((vid) => {
                                    const isPlaying = activeVideo?.id === vid.id;
                                    return (
                                      <button
                                        key={vid.id}
                                        onClick={() => setActiveVideo(vid)}
                                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                                          isPlaying 
                                            ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' 
                                            : 'hover:bg-white/5 text-slate-400 hover:text-white border border-transparent'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                          <PlayCircle size={14} className={isPlaying ? 'text-emerald-400' : 'text-slate-500'} />
                                          <span className="text-xs font-medium truncate">{vid.title}</span>
                                        </div>
                                        {vid.duration && (
                                          <span className="text-[10px] font-bold text-slate-500 shrink-0">{vid.duration}</span>
                                        )}
                                      </button>
                                    );
                                  })}
                                  {(!topic.videos || topic.videos.length === 0) && (
                                    <p className="text-[11px] text-slate-600 pl-6 py-1 italic">No videos uploaded.</p>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Video Content Panel */}
      <div className="flex-1 bg-slate-950 flex flex-col justify-between">
        {activeVideo ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Player Container */}
            <div className="aspect-video w-full bg-black relative flex items-center justify-center border-b border-white/5 overflow-hidden">
              <video 
                key={activeVideo.id} // Forces re-render of video tag when ID changes
                src={getSecureStreamUrl(activeVideo.id)}
                controls 
                autoPlay
                controlsList="nodownload"
                className="w-full h-full object-contain"
              >
                Your browser does not support HTML5 video player.
              </video>
            </div>

            {/* Video Details */}
            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h1 className="text-lg sm:text-2xl font-bold text-white leading-tight">
                    {activeVideo.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Now playing in {courseTitle}
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-black uppercase">
                  <Video size={14} />
                  <span>Secure Stream</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600/15 border border-emerald-500/25 flex items-center justify-center mb-6">
              <Play className="w-8 h-8 text-emerald-400 fill-current" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Start Learning</h2>
            <p className="text-slate-500 text-sm max-w-sm">
              Select a module and lesson from the sidebar menu to start watching the uploaded curriculum lectures.
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
