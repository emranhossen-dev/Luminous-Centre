"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, Clock, Users, Calendar, ExternalLink } from 'lucide-react';

interface LiveClass {
  id: number;
  title: string;
  courseTitle: string;
  instructor: string;
  startTime: string;
  duration: string;
  joinUrl: string;
  status: 'upcoming' | 'live' | 'ended';
  enrolledCount: number;
}

export default function ClassJoining() {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveClasses();
  }, []);

  const fetchLiveClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/student/live-classes', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setLiveClasses(data.classes || []);
      }
    } catch (error) {
      console.error('Failed to fetch live classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse';
      case 'upcoming': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'ended': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 mt-4">Loading live classes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Live Classes</h1>
        <p className="text-slate-400">Join your scheduled live sessions and interact with instructors.</p>
      </div>

      {liveClasses.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 rounded-3xl border-2 border-dashed border-white/5">
          <Video className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No live classes scheduled</h3>
          <p className="text-slate-500">Check back later for upcoming live sessions</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {liveClasses.map((liveClass, index) => (
            <motion.div
              key={liveClass.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden hover:border-emerald-500/30 transition-all"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{liveClass.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{liveClass.courseTitle}</p>
                    <p className="text-sm text-slate-400">by {liveClass.instructor}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusStyles(liveClass.status)}`}>
                    {liveClass.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(liveClass.startTime).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(liveClass.startTime).toLocaleTimeString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    {liveClass.enrolledCount} enrolled
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-sm text-slate-400">Duration: {liveClass.duration}</span>
                  {liveClass.status === 'live' ? (
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2">
                      <Video size={16} />
                      Join Now
                    </button>
                  ) : liveClass.status === 'upcoming' ? (
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2">
                      <Calendar size={16} />
                      Schedule Reminder
                    </button>
                  ) : (
                    <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2">
                      <ExternalLink size={16} />
                      View Recording
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
