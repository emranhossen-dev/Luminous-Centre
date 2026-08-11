"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Trash2, Star, Upload, X, Loader2, RefreshCw, 
  MessageSquareQuote, Eye, EyeOff, User, Edit2 
} from 'lucide-react';
import { toast } from 'react-toastify';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  comment: string;
  rating: number;
  avatar_url: string;
  is_active: boolean;
  sort_order: number;
}

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [form, setForm] = useState({
    name: '',
    role: 'Student',
    comment: '',
    rating: 5,
    avatar_url: '',
    sort_order: 0
  });

  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    try {
      // Pass all=true so admin sees both active AND hidden testimonials
      const res = await fetch('/api/testimonials?all=true');
      const data = await res.json();
      if (data.success) setItems(data.data);
    } catch {
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTestimonials(); }, [fetchTestimonials]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { toast.error('Photo must be under 3MB'); return; }
    if (!file.type.startsWith('image/')) { toast.error('Images only'); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleUploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile) return form.avatar_url || null;
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append('image', avatarFile);
      const res = await fetch('/api/admin/upload', {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd
      });
      const data = await res.json();
      if (data.success) return data.url;
      throw new Error('Avatar upload failed');
    } catch (err: any) {
      toast.error(err.message); return null;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setForm({ name: '', role: 'Student', comment: '', rating: 5, avatar_url: '', sort_order: 0 });
    setAvatarPreview('');
    setAvatarFile(null);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({ name: '', role: 'Student', comment: '', rating: 5, avatar_url: '', sort_order: 0 });
    setAvatarPreview('');
    setAvatarFile(null);
    setShowForm(true);
  };

  const handleOpenEdit = (item: Testimonial) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      role: item.role,
      comment: item.comment,
      rating: item.rating,
      avatar_url: item.avatar_url,
      sort_order: item.sort_order
    });
    setAvatarPreview(item.avatar_url || '');
    setAvatarFile(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.comment) {
      toast.error('Student Name and Feedback Comment are required');
      return;
    }
    
    let avatarUrl = form.avatar_url;
    if (avatarFile) {
      const uploaded = await handleUploadAvatar();
      if (uploaded) avatarUrl = uploaded;
    }

    try {
      const isEditing = Boolean(editingItem);
      const url = '/api/testimonials';
      const method = isEditing ? 'PUT' : 'POST';
      const payload = isEditing 
        ? { id: editingItem?.id, ...form, avatar_url: avatarUrl || editingItem?.avatar_url }
        : { ...form, avatar_url: avatarUrl || `https://i.pravatar.cc/150?u=${encodeURIComponent(form.name)}` };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(isEditing ? 'Feedback updated successfully!' : 'Student Feedback added successfully!');
        resetForm();
        fetchTestimonials();
      } else {
        toast.error(data.error || 'Failed to save feedback');
      }
    } catch {
      toast.error('Failed to save feedback');
    }
  };

  const handleToggleActive = async (item: Testimonial) => {
    try {
      const res = await fetch('/api/testimonials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id: item.id, is_active: !item.is_active }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(item.is_active ? 'Feedback hidden from website' : 'Feedback shown on website');
        // Update local state instantly
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_active: !i.is_active } : i));
      } else {
        toast.error('Failed to update status');
      }
    } catch { 
      toast.error('Update failed'); 
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this feedback?')) return;
    try {
      await fetch(`/api/testimonials?id=${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      toast.success('Feedback deleted');
      fetchTestimonials();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="min-h-screen bg-[#05060f] text-white p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <MessageSquareQuote size={18} className="text-purple-400" />
            </div>
            <h1 className="text-2xl font-black">Student Feedback Management</h1>
          </div>
          <p className="text-gray-500 text-sm">
            {items.length} total feedbacks · <span className="text-purple-400">{items.filter(i => i.is_active).length} visible on homepage</span> · <span className="text-amber-400">{items.filter(i => !i.is_active).length} hidden</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchTestimonials} className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer" title="Refresh">
            <RefreshCw size={16} className={`text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2F2FE4] hover:bg-[#162E93] text-white rounded-xl font-bold text-sm transition-all cursor-pointer shadow-lg shadow-blue-900/30"
          >
            <Plus size={16} /> Add Feedback
          </button>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-[#0c0e1f] border border-white/10 rounded-3xl w-full max-w-lg p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black">
                {editingItem ? 'Edit Student Feedback' : 'Add Student Feedback'}
              </h2>
              <button onClick={resetForm} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Student Photo */}
            <div className="mb-5">
              <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 block">Student Photo</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <User size={24} className="text-gray-500" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-300 hover:bg-white/10 cursor-pointer transition-all w-fit">
                    <Upload size={14} /> Upload New Photo
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
                  </label>
                  <p className="text-gray-600 text-xs">or paste image URL below</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Student Name *</label>
                <input
                  type="text"
                  placeholder="Student Name"
                  value={form.name}
                  onChange={e => setForm(p => ({...p, name: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                  style={{ fontFamily: 'var(--font-hind-siliguri)' }}
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Course / Designation</label>
                <input
                  type="text"
                  placeholder="e.g. MERN Stack Student"
                  value={form.role}
                  onChange={e => setForm(p => ({...p, role: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                  style={{ fontFamily: 'var(--font-hind-siliguri)' }}
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Photo URL (Optional)</label>
                <input
                  type="url"
                  placeholder="Photo URL"
                  value={form.avatar_url}
                  onChange={e => { setForm(p => ({...p, avatar_url: e.target.value})); if (!avatarFile) setAvatarPreview(e.target.value); }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 block">Rating (1 to 5 Stars)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm(p => ({...p, rating: star}))}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        form.rating >= star ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 'bg-white/5 border-white/10 text-gray-600'
                      }`}
                    >
                      <Star size={20} fill={form.rating >= star ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 block">Feedback Comment *</label>
                <textarea
                  rows={4}
                  placeholder="Student's review or experience..."
                  value={form.comment}
                  onChange={e => setForm(p => ({...p, comment: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 resize-none"
                  style={{ fontFamily: 'var(--font-hind-siliguri)' }}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={resetForm}
                className="flex-1 py-3 border border-white/10 bg-white/5 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={uploadingAvatar}
                className="flex-1 py-3 bg-[#2F2FE4] hover:bg-[#162E93] disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {uploadingAvatar ? <><Loader2 size={16} className="animate-spin" /> Uploading...</> : <><Edit2 size={16} /> {editingItem ? 'Update Feedback' : 'Save Feedback'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-purple-400" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <MessageSquareQuote size={48} className="text-gray-600" />
          <p className="text-gray-500 font-medium">No feedback added yet.</p>
          <button onClick={handleOpenAdd} className="flex items-center gap-2 px-5 py-2.5 bg-[#2F2FE4] text-white rounded-xl font-bold text-sm cursor-pointer">
            <Plus size={16} /> Add First Feedback
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div 
              key={item.id} 
              className={`rounded-2xl p-6 border transition-all relative ${
                item.is_active 
                  ? 'bg-[#0c0e1f] border-white/10' 
                  : 'bg-[#0c0e1f]/50 border-amber-500/20 opacity-75'
              }`}
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  item.is_active ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {item.is_active ? 'Visible' : 'Hidden'}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-4 pr-16">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 shrink-0">
                  <img src={item.avatar_url || 'https://i.pravatar.cc/150'} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-white text-base truncate">{item.name}</h3>
                  <p className="text-gray-400 text-xs truncate">{item.role}</p>
                </div>
              </div>

              <div className="flex gap-1 mb-3">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Star key={i} size={14} className="text-yellow-500 fill-yellow-500" />
                ))}
              </div>

              <p className="text-gray-300 text-sm leading-relaxed mb-5 italic line-clamp-4" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>
                "{item.comment}"
              </p>

              <div className="flex gap-2 pt-3 border-t border-white/10">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all cursor-pointer"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  onClick={() => handleToggleActive(item)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    item.is_active
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                      : 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20'
                  }`}
                  title={item.is_active ? "Hide from homepage" : "Show on homepage"}
                >
                  {item.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                  {item.is_active ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
