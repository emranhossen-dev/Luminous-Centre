"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, Clock, Calendar, Download, Search } from 'lucide-react';

interface Recording {
  id: number;
  title: string;
  courseTitle: string;
  instructor: string;
  recordedAt: string;
  duration: string;
  thumbnailUrl?: string;
  videoUrl: string;
  downloadUrl?: string;
  views: number;
}

export default function Recording() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/student/recordings', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setRecordings(data.recordings || []);
      }
    } catch (error) {
      console.error('Failed to fetch recordings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecordings = recordings.filter(recording =>
    recording.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recording.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Class Recordings</h1>
        <p className="text-slate-400">Access recorded sessions from your enrolled courses.</p>
      </div>

      {/* Search */}
      <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
          <input
            type="text"
            placeholder="Search recordings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
          />
        </div>
      </div>

      {filteredRecordings.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 rounded-3xl border-2 border-dashed border-white/5">
          <PlayCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No recordings found</h3>
          <p className="text-slate-500">
            {searchTerm ? 'Try adjusting your search' : 'Recordings will appear here once classes are completed'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRecordings.map((recording, index) => (
            <motion.div
              key={recording.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden hover:border-emerald-500/30 transition-all group"
            >
              <div className="flex flex-col md:flex-row gap-6 p-6">
                <div className="relative w-full md:w-40 h-24 rounded-xl overflow-hidden shrink-0">
                  <img 
                    src={recording.thumbnailUrl || '/placeholder.jpg'} 
                    className="w-full h-full object-cover" 
                    alt={recording.title} 
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <PlayCircle className="text-white" size={32} />
                  </div>
                </div>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {recording.title}
                    </h3>
                    <p className="text-sm text-slate-500">{recording.courseTitle}</p>
                    <p className="text-sm text-slate-400">by {recording.instructor}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(recording.recordedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {recording.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <PlayCircle size={14} />
                      {recording.views} views
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2">
                      <PlayCircle size={16} />
                      Watch Now
                    </button>
                    {recording.downloadUrl && (
                      <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2">
                        <Download size={16} />
                        Download
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
