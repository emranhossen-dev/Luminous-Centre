import React, { useState, useEffect } from 'react';
import { PlayCircle, Trash2, ArrowLeft, Loader2, Upload, FileVideo, Play, X, Plus, Save } from 'lucide-react';
import { toast } from 'react-toastify';

interface Course {
  id: number;
  title: string;
  slug: string;
  category: string;
}

interface MentorCurriculumVideosProps {
  course: Course;
  onBack: () => void;
}

interface Video {
  id: number;
  title: string;
  duration?: string;
  created_at?: string;
}

interface ClassTopic {
  id?: number;
  topic_name: string;
  order_index: number;
  videos: Video[];
  temp_video_id?: number; // associated video database id if uploaded before curriculum save
}

interface Milestone {
  id?: number;
  title: string;
  order_index: number;
  topics: ClassTopic[];
}

export default function MentorCurriculumVideos({ course, onBack }: MentorCurriculumVideosProps) {
  const [modules, setModules] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingTopicKey, setUploadingTopicKey] = useState<string | null>(null); // key format: "mIndex-tIndex"
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activeVideoTitle, setActiveVideoTitle] = useState<string>('');
  const [selectedClassKeys, setSelectedClassKeys] = useState<string[]>([]);

  const isAllMilestoneClassesSelected = (mIndex: number) => {
    const milestone = modules[mIndex];
    if (!milestone?.topics || milestone.topics.length === 0) return false;
    return milestone.topics.every((_, tIndex) => selectedClassKeys.includes(`${mIndex}-${tIndex}`));
  };

  const handleSelectAllMilestoneClasses = (mIndex: number) => {
    const milestone = modules[mIndex];
    if (!milestone?.topics || milestone.topics.length === 0) return;

    const keys = milestone.topics.map((_, tIndex) => `${mIndex}-${tIndex}`);
    if (isAllMilestoneClassesSelected(mIndex)) {
      setSelectedClassKeys(selectedClassKeys.filter(k => !keys.includes(k)));
    } else {
      const newKeys = [...selectedClassKeys];
      keys.forEach(k => {
        if (!newKeys.includes(k)) newKeys.push(k);
      });
      setSelectedClassKeys(newKeys);
    }
  };

  const handleBulkDeleteClasses = () => {
    if (selectedClassKeys.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete the ${selectedClassKeys.length} selected classes?`)) return;

    const updated = modules.map((m, mIndex) => {
      const filteredTopics = m.topics.filter((_, tIndex) => {
        const key = `${mIndex}-${tIndex}`;
        return !selectedClassKeys.includes(key);
      }).map((t, idx) => ({
        ...t,
        order_index: idx
      }));

      return {
        ...m,
        topics: filteredTopics
      };
    });

    setModules(updated);
    setSelectedClassKeys([]);
    toast.success(`Removed ${selectedClassKeys.length} classes locally. Click "Save Curriculum Changes" to save.`);
  };

  useEffect(() => {
    fetchCurriculum();
  }, [course.id]);

  const fetchCurriculum = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/courses/${course.id}/curriculum?t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        setModules(data.modules || []);
      } else {
        toast.error('Failed to load course milestones.');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred loading milestones.');
    } finally {
      setLoading(false);
    }
  };

  // Add a new Milestone
  const handleAddMilestone = () => {
    const newMilestone: Milestone = {
      title: `Milestone ${modules.length + 1}: `,
      order_index: modules.length,
      topics: []
    };
    setModules([...modules, newMilestone]);
    toast.info('Milestone added! Enter a title.');
  };

  // Delete a Milestone
  const handleDeleteMilestone = (mIndex: number) => {
    if (!window.confirm('Are you sure you want to delete this Milestone? All classes inside will be removed.')) return;
    const updated = modules.filter((_, idx) => idx !== mIndex).map((m, idx) => ({
      ...m,
      order_index: idx
    }));
    setModules(updated);
  };

  // Update Milestone Title
  const handleMilestoneTitleChange = (mIndex: number, newTitle: string) => {
    const updated = [...modules];
    updated[mIndex].title = newTitle;
    setModules(updated);
  };

  // Add a Class inside a Milestone
  const handleAddClass = (mIndex: number) => {
    const milestone = modules[mIndex];
    const newClass: ClassTopic = {
      topic_name: `Class ${milestone.topics.length + 1}: `,
      order_index: milestone.topics.length,
      videos: []
    };
    const updated = [...modules];
    updated[mIndex].topics = [...milestone.topics, newClass];
    setModules(updated);
  };

  // Delete a Class inside a Milestone
  const handleDeleteClass = (mIndex: number, tIndex: number) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    const updated = [...modules];
    const milestone = updated[mIndex];
    milestone.topics = milestone.topics.filter((_, idx) => idx !== tIndex).map((t, idx) => ({
      ...t,
      order_index: idx
    }));
    setModules(updated);
  };

  // Update Class Title
  const handleClassTitleChange = (mIndex: number, tIndex: number, newTitle: string) => {
    const updated = [...modules];
    updated[mIndex].topics[tIndex].topic_name = newTitle;
    setModules(updated);
  };

  // Save the entire Milestone and Class structure
  const handleSaveCurriculum = async () => {
    // Basic validation
    for (const m of modules) {
      if (!m.title.trim()) {
        toast.error('All milestones must have a valid title.');
        return;
      }
      for (const t of m.topics) {
        if (!t.topic_name.trim()) {
          toast.error('All classes must have a valid title.');
          return;
        }
      }
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/courses/${course.id}/curriculum`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ modules })
      });

      if (response.ok) {
        toast.success('Curriculum saved successfully! 🎉');
        fetchCurriculum();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to save curriculum');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while saving the curriculum.');
    } finally {
      setSaving(false);
    }
  };

  // Upload Video directly to Telegram for a specific Class
  const uploadVideoFile = (mIndex: number, tIndex: number, file: File) => {
    const allowedExtensions = ['.mp4', '.mkv', '.mov'];
    const fileName = file.name.toLowerCase();
    const lastDotIndex = fileName.lastIndexOf('.');
    const ext = lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : '';

    if (!allowedExtensions.includes(ext)) {
      toast.error(`Invalid video format "${ext}". Only mp4, mkv, and mov files are allowed.`);
      return;
    }

    const MAX_SIZE = 2 * 1024 * 1024 * 1024; // 2 GB limit (MTProto)
    if (file.size > MAX_SIZE) {
      toast.error(`File size exceeds 2 GB.`);
      return;
    }

    const uploadKey = `${mIndex}-${tIndex}`;
    setUploadingTopicKey(uploadKey);
    setUploadProgress(0);
    setUploadError(null);

    const topic = modules[mIndex].topics[tIndex];

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('video', file);
    formData.append('course_id', course.id.toString());
    formData.append('title', topic.topic_name);

    // If the topic already exists in the database, associate it immediately
    if (topic.id) {
      formData.append('lesson_id', topic.id.toString());
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/admin/videos/upload');
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      setUploadingTopicKey(null);
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.success && response.video) {
            toast.success('Video uploaded successfully via MTProto! 🎉');
            
            // Set the video locally so it displays instantly
            const updated = [...modules];
            const videoObj = response.video;
            updated[mIndex].topics[tIndex].videos = [videoObj];
            
            // If the topic is new (not in DB yet), store the video ID to associate on save
            if (!topic.id) {
              updated[mIndex].topics[tIndex].temp_video_id = videoObj.id;
            }
            setModules(updated);
          } else {
            toast.error(response.error || 'Failed to upload video');
          }
        } catch (e) {
          toast.error('Failed to parse upload response.');
        }
      } else {
        let errMsg = 'Server error during video upload.';
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
      setUploadingTopicKey(null);
      toast.error('Network connection error.');
    };

    xhr.send(formData);
  };

  // Delete video reference from Class
  const handleDeleteVideo = async (mIndex: number, tIndex: number, videoId: number) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/videos/${videoId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Video deleted.');
        const updated = [...modules];
        updated[mIndex].topics[tIndex].videos = [];
        delete updated[mIndex].topics[tIndex].temp_video_id;
        setModules(updated);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete video');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred deleting the video.');
    }
  };

  const handlePlayVideo = (videoId: number, title: string) => {
    const token = localStorage.getItem('token');
    const streamUrl = `/api/videos/stream/${videoId}?token=${token}`;
    setActiveVideoUrl(streamUrl);
    setActiveVideoTitle(title);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-950/40 px-2.5 py-1 rounded-full border border-blue-900/30">
              {course.category}
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight mt-1.5">{course.title}</h2>
          </div>
        </div>

        <div className="flex gap-3">
          {selectedClassKeys.length > 0 && (
            <button
              onClick={handleBulkDeleteClasses}
              className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/20 text-red-450 font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 transition active:scale-95 cursor-pointer text-xs"
            >
              <Trash2 className="w-4 h-4" /> Delete Selected ({selectedClassKeys.length})
            </button>
          )}
          <button
            onClick={handleAddMilestone}
            className="bg-slate-850 hover:bg-slate-800 border border-slate-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 transition active:scale-95 cursor-pointer text-xs"
          >
            <Plus className="w-4 h-4" /> Add Milestone
          </button>
          <button
            onClick={handleSaveCurriculum}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 transition active:scale-95 cursor-pointer text-xs"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Curriculum Changes
              </>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Course Milestones...</p>
        </div>
      ) : modules.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
          <FileVideo className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">No Milestones Added Yet</h3>
          <p className="text-slate-500 text-sm mb-4">Click "Add Milestone" to begin building this course's curriculum.</p>
          <button
            onClick={handleAddMilestone}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-xl inline-flex items-center gap-2 cursor-pointer text-xs"
          >
            <Plus className="w-4 h-4" /> Add First Milestone
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {modules.map((mod, mIndex) => (
            <div key={mod.id || `temp-m-${mIndex}`} className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between gap-4 border-b border-slate-800/60 pb-3">
                <div className="flex-1">
                  <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Milestone {mIndex + 1}</span>
                  <input
                    type="text"
                    value={mod.title}
                    onChange={(e) => handleMilestoneTitleChange(mIndex, e.target.value)}
                    className="w-full bg-transparent border-b border-transparent hover:border-slate-700 focus:border-blue-500 text-lg font-extrabold text-white outline-none py-0.5 transition"
                    placeholder="Enter Milestone Title..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  {mod.topics && mod.topics.length > 0 && (
                    <button
                      onClick={() => handleSelectAllMilestoneClasses(mIndex)}
                      className="bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-bold py-1.5 px-3 rounded-lg text-xs cursor-pointer transition border border-slate-700"
                    >
                      {isAllMilestoneClassesSelected(mIndex) ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                  <button
                    onClick={() => handleAddClass(mIndex)}
                    className="bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition border border-slate-700"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Class
                  </button>
                  <button
                    onClick={() => handleDeleteMilestone(mIndex)}
                    className="p-1.5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg cursor-pointer transition"
                    title="Delete Milestone"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {mod.topics && mod.topics.length > 0 ? (
                  mod.topics.map((topic, tIndex) => {
                    const video = topic.videos && topic.videos[0];
                    const isUploading = uploadingTopicKey === `${mIndex}-${tIndex}`;
                    
                    return (
                      <div
                        key={topic.id || `temp-t-${mIndex}-${tIndex}`}
                        className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex-1 flex items-start gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={selectedClassKeys.includes(`${mIndex}-${tIndex}`)}
                            onChange={(e) => {
                              const key = `${mIndex}-${tIndex}`;
                              if (e.target.checked) {
                                setSelectedClassKeys([...selectedClassKeys, key]);
                              } else {
                                setSelectedClassKeys(selectedClassKeys.filter(k => k !== key));
                              }
                            }}
                            className="w-4.5 h-4.5 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500/40 cursor-pointer accent-blue-500 mt-1 shrink-0"
                          />
                          <div className="p-2 bg-slate-900 border border-slate-800 text-slate-400 rounded-lg shrink-0 mt-0.5">
                            <FileVideo className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={topic.topic_name}
                              onChange={(e) => handleClassTitleChange(mIndex, tIndex, e.target.value)}
                              className="w-full bg-transparent border-b border-transparent hover:border-slate-800 focus:border-blue-500 text-sm font-bold text-slate-200 outline-none py-0.5 transition"
                              placeholder="Enter Class Title..."
                            />
                            {video ? (
                              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-semibold">
                                <span className="text-green-400">Video: {video.title}</span>
                                {video.duration && <span>• {video.duration}</span>}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-500 mt-1 block">No video lesson attached</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {video ? (
                            <>
                              <button
                                onClick={() => handlePlayVideo(video.id, topic.topic_name)}
                                className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                              >
                                <Play className="w-3.5 h-3.5 fill-blue-400" /> Play
                              </button>
                              <button
                                onClick={() => handleDeleteVideo(mIndex, tIndex, video.id)}
                                className="p-1.5 bg-red-650/20 hover:bg-red-650/30 text-red-400 border border-red-500/20 rounded-lg transition cursor-pointer"
                                title="Remove Video"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : isUploading ? (
                            <div className="w-36 md:w-44 space-y-1.5">
                              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                                <span>Uploading...</span>
                                <span>{uploadProgress}%</span>
                              </div>
                              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-700">
                                <div className="bg-blue-600 h-full transition-all duration-150" style={{ width: `${uploadProgress}%` }}></div>
                              </div>
                            </div>
                          ) : (
                            <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer active:scale-95">
                              <Upload className="w-3.5 h-3.5" /> Upload Video
                              <input
                                type="file"
                                accept=".mp4,.mkv,.mov"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) uploadVideoFile(mIndex, tIndex, file);
                                }}
                              />
                            </label>
                          )}
                          <button
                            onClick={() => handleDeleteClass(mIndex, tIndex)}
                            className="p-1.5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg cursor-pointer transition"
                            title="Delete Class"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500 italic py-2">No classes defined in this milestone. Click "Add Class" to start adding sessions.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* HTML5 Secure Video Modal */}
      {activeVideoUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl relative">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
              <h3 className="font-extrabold text-white text-md truncate pr-8">{activeVideoTitle}</h3>
              <button
                onClick={() => {
                  setActiveVideoUrl(null);
                  setActiveVideoTitle('');
                }}
                className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 bg-black flex items-center justify-center">
              <video
                src={activeVideoUrl}
                controls
                autoPlay
                controlsList="nodownload"
                className="w-full max-h-[500px] rounded-xl object-contain border border-slate-800 bg-slate-950"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
