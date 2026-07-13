"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Video,
  CheckCircle,
  PlayCircle,
  ChevronRight,
  StickyNote,
  FileDown,
  ListTodo,
  Save,
  Loader2,
  X,
  Link as LinkIcon
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

interface VideoProgress {
  lesson_video_id: number;
  completed: boolean;
}

interface LessonResource {
  id: number;
  title: string;
  url: string;
  file_type: string;
}

interface LessonTask {
  id: number;
  title: string;
  description: string;
  due_date: string;
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
  
  // Video progress tracking
  const [videoProgress, setVideoProgress] = useState<Record<number, boolean>>({});
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Info panel state
  const [activeInfoTab, setActiveInfoTab] = useState<'notes' | 'resources' | 'task' | null>(null);
  const [notes, setNotes] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [resources, setResources] = useState<LessonResource[]>([]);
  const [tasks, setTasks] = useState<LessonTask[]>([]);

  // Build flat list of all videos for prev/next navigation
  const allVideos: VideoData[] = [];
  modules.forEach(mod => {
    mod.topics.forEach(topic => {
      if (topic.videos) {
        topic.videos.forEach(vid => allVideos.push(vid));
      }
    });
  });
  const activeVideoIndex = activeVideo ? allVideos.findIndex(v => v.id === activeVideo.id) : -1;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setVideoToken(localStorage.getItem('token') || '');
    }
    fetchCurriculum();
    fetchVideoProgress();
  }, [courseId]);

  // When active video changes, load its notes/resources/tasks
  useEffect(() => {
    if (activeVideo) {
      fetchNotesForVideo(activeVideo.id);
      fetchResourcesForVideo(activeVideo.id);
      fetchTasksForVideo(activeVideo.id);
    }
  }, [activeVideo?.id]);

  async function fetchCurriculum() {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/courses/${courseId}/curriculum`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to load course modules');

      const data = await response.json();
      const fetchedModules = data.modules || [];
      setModules(fetchedModules);

      // Expand first module and select first video
      if (fetchedModules.length > 0) {
        setExpandedModules({ [fetchedModules[0].id]: true });
        
        let firstVideo: VideoData | null = null;
        for (const mod of fetchedModules) {
          for (const topic of mod.topics) {
            if (topic.videos?.length > 0) {
              firstVideo = topic.videos[0];
              break;
            }
          }
          if (firstVideo) break;
        }
        if (firstVideo) setActiveVideo(firstVideo);
      }
    } catch (err: any) {
      console.error('Failed to load curriculum:', err);
      setError(err.message || 'Failed to load curriculum');
    } finally {
      setLoading(false);
    }
  }

  async function fetchVideoProgress() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/student/video-progress?courseId=${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const progressMap: Record<number, boolean> = {};
        (data.progress || []).forEach((p: VideoProgress) => {
          progressMap[p.lesson_video_id] = p.completed;
        });
        setVideoProgress(progressMap);
      }
    } catch (e) {
      console.error('Failed to fetch video progress:', e);
    }
  }

  async function fetchNotesForVideo(videoId: number) {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/student/lesson-notes?lessonVideoId=${videoId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(data.content || '');
      }
    } catch (e) {
      setNotes('');
    }
  }

  async function fetchResourcesForVideo(videoId: number) {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/student/lesson-resources?lessonVideoId=${videoId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setResources(data.resources || []);
      }
    } catch (e) {
      setResources([]);
    }
  }

  async function fetchTasksForVideo(videoId: number) {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/student/lesson-tasks?lessonVideoId=${videoId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (e) {
      setTasks([]);
    }
  }

  const saveNotes = async () => {
    if (!activeVideo) return;
    setNotesSaving(true);
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/student/lesson-notes', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonVideoId: activeVideo.id, content: notes })
      });
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } catch (e) {
      console.error('Failed to save notes:', e);
    } finally {
      setNotesSaving(false);
    }
  };

  const markVideoCompleted = useCallback(async (videoId: number) => {
    if (videoProgress[videoId]) return; // Already completed
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/student/video-progress', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonVideoId: videoId, watchedSeconds: 0, totalSeconds: 0, completed: true })
      });
      setVideoProgress(prev => ({ ...prev, [videoId]: true }));
    } catch (e) {
      console.error('Failed to mark video completed:', e);
    }
  }, [videoProgress]);

  // Auto-mark as completed when video ends
  const handleVideoEnded = () => {
    if (activeVideo) {
      markVideoCompleted(activeVideo.id);
    }
  };

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const getSecureStreamUrl = (videoId: number) => {
    return `/api/videos/stream/${videoId}?token=${encodeURIComponent(videoToken)}`;
  };

  const goToPrevVideo = () => {
    if (activeVideoIndex > 0) {
      setActiveVideo(allVideos[activeVideoIndex - 1]);
      setActiveInfoTab(null);
    }
  };

  const goToNextVideo = () => {
    if (activeVideoIndex < allVideos.length - 1) {
      setActiveVideo(allVideos[activeVideoIndex + 1]);
      setActiveInfoTab(null);
    }
  };

  const toggleInfoTab = (tab: 'notes' | 'resources' | 'task') => {
    setActiveInfoTab(prev => prev === tab ? null : tab);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 text-sm mt-3">Loading course content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-rose-400 text-sm mb-4">{error}</p>
        <button onClick={onBack} className="text-emerald-400 text-sm underline cursor-pointer">Go Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Course Header Bar */}
      <div className="flex items-center gap-3 mb-4 px-1">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="min-w-0">
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Course Player</p>
          <h1 className="text-sm sm:text-base font-bold text-white truncate">{courseTitle}</h1>
        </div>
      </div>

      {/* Video Player Section */}
      <div className="rounded-2xl overflow-hidden bg-black border border-white/5">
        {activeVideo ? (
          <div className="aspect-video w-full relative">
            <video
              ref={videoRef}
              key={activeVideo.id}
              src={getSecureStreamUrl(activeVideo.id)}
              controls
              autoPlay
              controlsList="nodownload"
              className="w-full h-full object-contain bg-black"
              onEnded={handleVideoEnded}
            >
              Your browser does not support the HTML5 video player.
            </video>
          </div>
        ) : (
          <div className="aspect-video w-full flex flex-col items-center justify-center bg-slate-950">
            <PlayCircle className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-slate-500 text-sm">Select a lesson to start watching</p>
          </div>
        )}
      </div>

      {/* Video Info + Navigation */}
      {activeVideo && (
        <div className="mt-4 space-y-4">
          {/* Video Title & Info */}
          <div className="flex items-start justify-between gap-3 px-1">
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white leading-snug">{activeVideo.title}</h2>
              <p className="text-xs text-slate-500 mt-1">Now playing in {courseTitle}</p>
            </div>
            {videoProgress[activeVideo.id] && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-[10px] font-bold uppercase shrink-0">
                <CheckCircle size={12} />
                <span>Completed</span>
              </div>
            )}
          </div>

          {/* Previous / Next Buttons */}
          <div className="flex items-center gap-3 px-1">
            <button
              onClick={goToPrevVideo}
              disabled={activeVideoIndex <= 0}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeVideoIndex <= 0
                  ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-white/5'
              }`}
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <button
              onClick={goToNextVideo}
              disabled={activeVideoIndex >= allVideos.length - 1}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeVideoIndex >= allVideos.length - 1
                  ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                  : 'bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Info Toggle Buttons */}
          <div className="flex flex-wrap items-center gap-2 px-1">
            <button
              onClick={() => toggleInfoTab('notes')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeInfoTab === 'notes'
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white border border-white/5 hover:border-white/10'
              }`}
            >
              <StickyNote size={14} />
              Notes
            </button>
            <button
              onClick={() => toggleInfoTab('resources')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeInfoTab === 'resources'
                  ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white border border-white/5 hover:border-white/10'
              }`}
            >
              <FileDown size={14} />
              Resources
            </button>
            <button
              onClick={() => toggleInfoTab('task')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeInfoTab === 'task'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white border border-white/5 hover:border-white/10'
              }`}
            >
              <ListTodo size={14} />
              Task
            </button>
          </div>

          {/* Collapsible Info Panel */}
          <AnimatePresence>
            {activeInfoTab && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-slate-900/50 rounded-2xl border border-white/5 p-4 sm:p-5">
                  {/* Notes Panel */}
                  {activeInfoTab === 'notes' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <StickyNote size={16} className="text-blue-400" />
                          My Notes
                        </h3>
                        <button
                          onClick={saveNotes}
                          disabled={notesSaving}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/20 text-blue-400 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                        >
                          {notesSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                          {notesSaved ? 'Saved!' : 'Save Notes'}
                        </button>
                      </div>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Type your notes here... These notes are private and saved to your account."
                        className="w-full h-32 sm:h-40 bg-slate-800/50 border border-white/5 rounded-xl p-3 text-sm text-slate-300 placeholder-slate-600 resize-none focus:outline-none focus:border-blue-500/30 transition-colors"
                      />
                    </div>
                  )}

                  {/* Resources Panel */}
                  {activeInfoTab === 'resources' && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <FileDown size={16} className="text-purple-400" />
                        Resources
                      </h3>
                      {resources.length === 0 ? (
                        <div className="text-center py-8">
                          <FileDown className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                          <p className="text-xs text-slate-500">No resources added for this lesson yet.</p>
                          <p className="text-[10px] text-slate-600 mt-1">Your mentor will add downloadable resources here.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {resources.map(resource => (
                            <a
                              key={resource.id}
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-white/5 hover:border-purple-500/20 transition-colors group"
                            >
                              <LinkIcon size={14} className="text-purple-400 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-white group-hover:text-purple-400 transition-colors truncate">{resource.title}</p>
                                {resource.file_type && <p className="text-[10px] text-slate-500 uppercase">{resource.file_type}</p>}
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Task Panel */}
                  {activeInfoTab === 'task' && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <ListTodo size={16} className="text-amber-400" />
                        Tasks
                      </h3>
                      {tasks.length === 0 ? (
                        <div className="text-center py-8">
                          <ListTodo className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                          <p className="text-xs text-slate-500">No tasks assigned for this lesson yet.</p>
                          <p className="text-[10px] text-slate-600 mt-1">Your mentor will assign practice tasks here.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {tasks.map(task => (
                            <div
                              key={task.id}
                              className="p-3 bg-slate-800/40 rounded-xl border border-white/5"
                            >
                              <p className="text-xs font-bold text-white mb-1">{task.title}</p>
                              {task.description && <p className="text-[11px] text-slate-400 leading-relaxed">{task.description}</p>}
                              {task.due_date && (
                                <p className="text-[10px] text-amber-400 mt-2 font-medium">
                                  Due: {new Date(task.due_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* All Modules List (Accordion) */}
      <div className="mt-6 space-y-2">
        <h3 className="text-sm font-bold text-white px-1 mb-3 flex items-center gap-2">
          <BookOpen size={16} className="text-emerald-400" />
          Course Modules
        </h3>
        
        {modules.length === 0 ? (
          <div className="text-center py-10 bg-slate-900/30 rounded-2xl border border-white/5">
            <p className="text-xs text-slate-500">No modules have been added to this course yet.</p>
          </div>
        ) : (
          modules.map((mod, index) => {
            const isExpanded = !!expandedModules[mod.id];
            const totalVids = mod.topics.reduce((sum, t) => sum + (t.videos?.length || 0), 0);
            const completedVids = mod.topics.reduce((sum, t) => 
              sum + (t.videos?.filter(v => videoProgress[v.id])?.length || 0), 0);
            
            return (
              <div key={mod.id} className="bg-slate-900/40 rounded-2xl border border-white/5 overflow-hidden">
                {/* Module Header */}
                <button 
                  onClick={() => toggleModule(mod.id)}
                  className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-white/5 transition-all text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3 pr-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-black text-emerald-400">{(index + 1).toString().padStart(2, '0')}</span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-bold text-white truncate block">{mod.title}</span>
                      {totalVids > 0 && (
                        <span className="text-[10px] text-slate-500">{completedVids}/{totalVids} lessons completed</span>
                      )}
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={16} className="text-slate-500 shrink-0" />
                  ) : (
                    <ChevronDown size={16} className="text-slate-500 shrink-0" />
                  )}
                </button>

                {/* Topics & Videos */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-white/5 bg-slate-950/20"
                    >
                      <div className="p-2 space-y-1">
                        {mod.topics.length === 0 ? (
                          <p className="text-[11px] text-slate-500 p-3 italic">No topics in this module.</p>
                        ) : (
                          mod.topics.map((topic) => (
                            <div key={topic.id} className="space-y-1">
                              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 tracking-wider flex items-center gap-1.5 uppercase">
                                <BookOpen size={10} />
                                <span>{topic.topic_name}</span>
                              </div>
                              <div className="space-y-0.5 pl-1">
                                {topic.videos?.map((vid) => {
                                  const isPlaying = activeVideo?.id === vid.id;
                                  const isCompleted = videoProgress[vid.id];
                                  return (
                                    <button
                                      key={vid.id}
                                      onClick={() => {
                                        setActiveVideo(vid);
                                        setActiveInfoTab(null);
                                      }}
                                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                                        isPlaying 
                                          ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' 
                                          : 'hover:bg-white/5 text-slate-400 hover:text-white border border-transparent'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                        {isCompleted ? (
                                          <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                                        ) : isPlaying ? (
                                          <PlayCircle size={14} className="text-emerald-400 shrink-0" />
                                        ) : (
                                          <PlayCircle size={14} className="text-slate-600 shrink-0" />
                                        )}
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
  );
}
