"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FolderOpen, 
  FileText, 
  Download, 
  Search, 
  Filter,
  BookOpen,
  Video,
  FileImage,
  File
} from 'lucide-react';

interface Resource {
  id: number;
  title: string;
  description: string;
  type: 'document' | 'video' | 'image' | 'link' | 'other';
  fileUrl?: string;
  downloadUrl?: string;
  fileSize?: string;
  courseTitle: string;
  uploadedAt: string;
  instructor: string;
}

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/student/resources', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setResources(data.resources || []);
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'document': return FileText;
      case 'video': return Video;
      case 'image': return FileImage;
      default: return File;
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'document': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'video': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'image': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'link': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || resource.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const types = ['all', 'document', 'video', 'image', 'link', 'other'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 mt-4">Loading resources...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Learning Resources</h1>
        <p className="text-slate-400">Access course materials, documents, and supplementary resources.</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
          >
            {types.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredResources.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 rounded-3xl border-2 border-dashed border-white/5">
          <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No resources found</h3>
          <p className="text-slate-500">
            {searchTerm ? 'Try adjusting your search or filters' : 'Resources will appear here once available'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredResources.map((resource, index) => {
            const Icon = getFileIcon(resource.type);
            
            return (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-900/50 rounded-2xl border border-white/5 p-6 hover:border-emerald-500/30 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${getTypeStyles(resource.type)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-slate-500">{resource.courseTitle}</p>
                      <p className="text-sm text-slate-400">by {resource.instructor}</p>
                    </div>

                    <p className="text-sm text-slate-400 leading-relaxed">
                      {resource.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className={`px-2 py-1 rounded-lg border ${getTypeStyles(resource.type)}`}>
                        {resource.type}
                      </span>
                      {resource.fileSize && (
                        <span>{resource.fileSize}</span>
                      )}
                      <span>{new Date(resource.uploadedAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2">
                        <BookOpen size={16} />
                        View
                      </button>
                      {resource.downloadUrl && (
                        <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2">
                          <Download size={16} />
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
