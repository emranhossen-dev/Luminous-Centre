"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Upload, Trash2, Star, StarOff, ImagePlus, 
  X, CheckCircle, Loader2, Camera, Grid3X3, RefreshCw, Images
} from 'lucide-react';
import { toast } from 'react-toastify';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
}

interface SelectedFileWithPreview {
  file: File;
  previewUrl: string;
  id: string;
}

const CATEGORIES = ['general', 'classroom', 'lab', 'event', 'certification'];

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Upload form state
  const [form, setForm] = useState({ title: '', description: '', category: 'general', is_featured: false });
  const [selectedFiles, setSelectedFiles] = useState<SelectedFileWithPreview[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gallery');
      const data = await res.json();
      if (data.success) setItems(data.data);
    } catch {
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGallery(); }, [fetchGallery]);

  const handleMultipleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles: SelectedFileWithPreview[] = [];
    files.forEach(file => {
      if (file.size > 8 * 1024 * 1024) {
        toast.warn(`Skipped ${file.name} (over 8MB)`);
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.warn(`Skipped ${file.name} (not an image)`);
        return;
      }
      validFiles.push({
        file,
        previewUrl: URL.createObjectURL(file),
        id: Math.random().toString(36).substring(2, 9),
      });
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleRemoveSelected = (id: string) => {
    setSelectedFiles(prev => {
      const filtered = prev.filter(f => f.id !== id);
      const removed = prev.find(f => f.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return filtered;
    });
  };

  const handleBatchUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    setUploading(true);
    const uploadedBatch = [];
    let successCount = 0;

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const item = selectedFiles[i];
        setUploadProgress(`Uploading ${i + 1} of ${selectedFiles.length} photos...`);

        // Step 1: Upload image file to ImgBB via admin upload API
        const fd = new FormData();
        fd.append('image', item.file);

        const uploadRes = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: fd,
        });

        const uploadResult = await uploadRes.json();
        if (uploadResult.success && uploadResult.url) {
          uploadedBatch.push({
            title: form.title ? `${form.title} ${i + 1}` : item.file.name.replace(/\.[^/.]+$/, ""),
            description: form.description || '',
            category: form.category || 'general',
            image_url: uploadResult.url,
            is_featured: form.is_featured,
            sort_order: i,
          });
          successCount++;
        }
      }

      if (uploadedBatch.length > 0) {
        setUploadProgress('Saving to gallery database...');
        // Step 2: Save array of gallery items in database
        const saveRes = await fetch('/api/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(uploadedBatch),
        });

        const saveResult = await saveRes.json();
        if (saveResult.success) {
          toast.success(`Successfully uploaded ${successCount} photos!`);
          setShowUploadForm(false);
          // Revoke preview object URLs
          selectedFiles.forEach(f => URL.revokeObjectURL(f.previewUrl));
          setSelectedFiles([]);
          setForm({ title: '', description: '', category: 'general', is_featured: false });
          fetchGallery();
        } else {
          throw new Error(saveResult.error || 'Failed to save photos to database');
        }
      } else {
        throw new Error('All image uploads failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Batch upload failed');
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };


  const handleDelete = async (id: string) => {
    if (!confirm('Delete this photo?')) return;
    try {
      await fetch(`/api/gallery?id=${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      toast.success('Photo deleted');
      fetchGallery();
    } catch { toast.error('Delete failed'); }
  };

  const handleToggleFeatured = async (item: GalleryItem) => {
    try {
      await fetch('/api/gallery', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id: item.id, is_featured: !item.is_featured }),
      });
      toast.success(item.is_featured ? 'Removed from homepage' : 'Added to homepage!');
      fetchGallery();
    } catch { toast.error('Update failed'); }
  };

  const filtered = filterCategory === 'all' ? items : items.filter(i => i.category === filterCategory);
  const featuredCount = items.filter(i => i.is_featured).length;

  return (
    <div className="min-h-screen bg-[#05060f] text-white p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Camera size={18} className="text-blue-400" />
            </div>
            <h1 className="text-2xl font-black">Gallery Management</h1>
          </div>
          <p className="text-gray-500 text-sm">
            {items.length} photos total · <span className="text-yellow-400">{featuredCount} featured on homepage</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchGallery} className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
            <RefreshCw size={16} className="text-gray-400" />
          </button>
          <button
            onClick={() => setShowUploadForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2F2FE4] hover:bg-[#162E93] text-white rounded-xl font-bold text-sm transition-all cursor-pointer"
          >
            <Images size={16} /> Batch Upload Photos
          </button>
        </div>
      </div>

      {/* Multiple Image Upload Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0c0e1f] border border-white/10 rounded-3xl w-full max-w-2xl p-6 md:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black flex items-center gap-2">
                  <Images size={20} className="text-blue-400" /> Multiple Image Upload
                </h2>
                <p className="text-gray-500 text-xs mt-0.5">একসাথে একাধিক ছবি সিলেক্ট করে আপলোড করুন</p>
              </div>
              <button
                onClick={() => {
                  if (uploading) return;
                  setShowUploadForm(false);
                  selectedFiles.forEach(f => URL.revokeObjectURL(f.previewUrl));
                  setSelectedFiles([]);
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Select Multiple Files Dropzone */}
            <label className="block cursor-pointer mb-6">
              <div className="w-full py-8 px-6 rounded-2xl border-2 border-dashed border-blue-500/30 hover:border-blue-500/60 bg-blue-500/[0.02] hover:bg-blue-500/[0.05] transition-all flex flex-col items-center justify-center gap-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Upload size={24} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">ছবি সিলেক্ট করুন (Multiple Images Allowed)</p>
                  <p className="text-gray-400 text-xs mt-1">একসাথে ১০-২০টি ছবি বা যতো খুশি সিলেক্ট করতে পারবেন (JPG, PNG, WEBP)</p>
                </div>
                <span className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer">
                  Browse Files
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleMultipleFilesSelect}
                disabled={uploading}
              />
            </label>

            {/* Selected Images Grid Preview */}
            {selectedFiles.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Selected Images ({selectedFiles.length})
                  </span>
                  <button
                    onClick={() => {
                      selectedFiles.forEach(f => URL.revokeObjectURL(f.previewUrl));
                      setSelectedFiles([]);
                    }}
                    className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-56 overflow-y-auto p-2 bg-white/[0.02] border border-white/5 rounded-2xl">
                  {selectedFiles.map((item, idx) => (
                    <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                      <img src={item.previewUrl} alt={`preview ${idx}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleRemoveSelected(item.id)}
                        disabled={uploading}
                        className="absolute top-1 right-1 p-1 rounded-md bg-red-600/80 hover:bg-red-600 text-white cursor-pointer transition-opacity opacity-80 hover:opacity-100"
                        title="Remove image"
                      >
                        <X size={12} />
                      </button>
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-[9px] font-bold text-white rounded">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Batch Form Settings */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 block">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(p => ({...p, category: e.target.value}))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 cursor-pointer"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#0c0e1f]">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                    <input
                      type="checkbox"
                      checked={form.is_featured}
                      onChange={e => setForm(p => ({...p, is_featured: e.target.checked}))}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <span className="text-sm text-gray-300 font-medium">Show on Homepage</span>
                  </label>
                </div>
              </div>

              <input
                type="text"
                placeholder="Title prefix (optional, e.g. Class Moment)"
                value={form.title}
                onChange={e => setForm(p => ({...p, title: e.target.value}))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={form.description}
                onChange={e => setForm(p => ({...p, description: e.target.value}))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
              />
            </div>

            {/* Upload status message */}
            {uploading && (
              <div className="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                {uploadProgress}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  if (uploading) return;
                  setShowUploadForm(false);
                  selectedFiles.forEach(f => URL.revokeObjectURL(f.previewUrl));
                  setSelectedFiles([]);
                }}
                disabled={uploading}
                className="flex-1 py-3 border border-white/10 bg-white/5 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBatchUpload}
                disabled={uploading || selectedFiles.length === 0}
                className="flex-1 py-3 bg-[#2F2FE4] hover:bg-[#162E93] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <><Loader2 size={16} className="animate-spin" /> Uploading Batch...</>
                ) : (
                  <><Upload size={16} /> Upload {selectedFiles.length > 0 ? `(${selectedFiles.length} Photos)` : ''}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', ...CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer capitalize
              ${filterCategory === cat
                ? 'bg-[#2F2FE4] border-blue-500 text-white'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
          >
            {cat} {cat === 'all' ? `(${items.length})` : `(${items.filter(i => i.category === cat).length})`}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-blue-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Grid3X3 size={48} className="text-gray-600" />
          <p className="text-gray-500 font-medium">No photos yet. Upload your first photos!</p>
          <button
            onClick={() => setShowUploadForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2F2FE4] text-white rounded-xl font-bold text-sm cursor-pointer"
          >
            <Images size={16} /> Batch Upload Photos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(item => (
            <div key={item.id} className="group relative rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02] hover:border-white/10 transition-all">
              <div className="relative aspect-[4/3]">
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                {item.is_featured && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-yellow-500 text-black rounded-lg text-[10px] font-black">
                    <Star size={10} fill="currentColor" /> HOMEPAGE
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 bg-black/60 text-white rounded-lg text-[10px] font-bold uppercase backdrop-blur-sm">
                    {item.category}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <p className="text-white font-bold text-sm truncate mb-1">{item.title || 'Untitled'}</p>
                <p className="text-gray-500 text-xs truncate mb-4">{item.description || 'No description'}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleFeatured(item)}
                    title={item.is_featured ? 'Remove from homepage' : 'Show on homepage'}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer
                      ${item.is_featured
                        ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-yellow-400 hover:border-yellow-500/30'
                      }`}
                  >
                    {item.is_featured ? <Star size={12} fill="currentColor" /> : <StarOff size={12} />}
                    {item.is_featured ? 'Featured' : 'Feature'}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
