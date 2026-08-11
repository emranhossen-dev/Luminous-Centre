"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Trash2, Building2, Globe, Upload, X, Loader2, RefreshCw, Eye, EyeOff, Edit2 
} from 'lucide-react';
import { toast } from 'react-toastify';

interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website_url: string;
  description: string;
  is_active: boolean;
  sort_order: number;
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [form, setForm] = useState({ name: '', logo_url: '', website_url: '', description: '', sort_order: 0 });
  const [logoPreview, setLogoPreview] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      // Pass all=true so admin sees both active AND hidden partners
      const res = await fetch('/api/partners?all=true');
      const data = await res.json();
      if (data.success) setPartners(data.data);
    } catch { 
      toast.error('Failed to load partners'); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { fetchPartners(); }, [fetchPartners]);

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { toast.error('Logo must be under 3MB'); return; }
    if (!file.type.startsWith('image/')) { toast.error('Images only'); return; }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleUploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return form.logo_url || null;
    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append('image', logoFile);
      const res = await fetch('/api/admin/upload', {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd
      });
      const data = await res.json();
      if (data.success) return data.url;
      throw new Error('Logo upload failed');
    } catch (err: any) {
      toast.error(err.message); return null;
    } finally { setUploadingLogo(false); }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingPartner(null);
    setForm({ name: '', logo_url: '', website_url: '', description: '', sort_order: 0 });
    setLogoPreview('');
    setLogoFile(null);
  };

  const handleOpenAdd = () => {
    setEditingPartner(null);
    setForm({ name: '', logo_url: '', website_url: '', description: '', sort_order: 0 });
    setLogoPreview('');
    setLogoFile(null);
    setShowForm(true);
  };

  const handleOpenEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setForm({
      name: partner.name,
      logo_url: partner.logo_url,
      website_url: partner.website_url || '',
      description: partner.description || '',
      sort_order: partner.sort_order || 0
    });
    setLogoPreview(partner.logo_url || '');
    setLogoFile(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('Partner name is required'); return; }
    
    let logoUrl = form.logo_url;
    if (logoFile) {
      const uploaded = await handleUploadLogo();
      if (!uploaded) return;
      logoUrl = uploaded;
    }
    if (!logoUrl) { toast.error('Please upload a logo or enter a logo URL'); return; }

    try {
      const isEditing = Boolean(editingPartner);
      const url = '/api/partners';
      const method = isEditing ? 'PUT' : 'POST';
      const payload = isEditing
        ? { id: editingPartner?.id, ...form, logo_url: logoUrl }
        : { ...form, logo_url: logoUrl };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(isEditing ? 'Partner updated successfully!' : 'Partner added successfully!');
        resetForm();
        fetchPartners();
      } else {
        toast.error(data.error || 'Failed to save partner');
      }
    } catch { 
      toast.error('Failed to save partner'); 
    }
  };

  const handleToggleActive = async (partner: Partner) => {
    try {
      const res = await fetch('/api/partners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id: partner.id, is_active: !partner.is_active }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(partner.is_active ? 'Partner hidden from homepage' : 'Partner shown on homepage');
        // Update local state immediately
        setPartners(prev => prev.map(p => p.id === partner.id ? { ...p, is_active: !p.is_active } : p));
      } else {
        toast.error('Failed to update status');
      }
    } catch { 
      toast.error('Update failed'); 
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this partner?')) return;
    try {
      await fetch(`/api/partners?id=${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      toast.success('Partner deleted');
      fetchPartners();
    } catch { toast.error('Delete failed'); }
  };

  const activeCount = partners.filter(p => p.is_active).length;

  return (
    <div className="min-h-screen bg-[#05060f] text-white p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <Building2 size={18} className="text-green-400" />
            </div>
            <h1 className="text-2xl font-black">Trusted Partners Management</h1>
          </div>
          <p className="text-gray-500 text-sm">
            {partners.length} total · <span className="text-green-400">{activeCount} visible on homepage</span> · <span className="text-amber-400">{partners.length - activeCount} hidden</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchPartners} className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer" title="Refresh">
            <RefreshCw size={16} className={`text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2F2FE4] hover:bg-[#162E93] text-white rounded-xl font-bold text-sm transition-all cursor-pointer shadow-lg shadow-blue-900/30"
          >
            <Plus size={16} /> Add Partner
          </button>
        </div>
      </div>

      {/* Add / Edit Partner Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-[#0c0e1f] border border-white/10 rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black">
                {editingPartner ? 'Edit Partner Details' : 'Add New Partner'}
              </h2>
              <button onClick={resetForm} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Logo Upload */}
            <div className="mb-5">
              <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 block">Partner Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {logoPreview ? (
                    <img src={logoPreview} alt="logo" className="w-full h-full object-contain p-2" />
                  ) : (
                    <Building2 size={24} className="text-gray-600" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-300 hover:bg-white/10 cursor-pointer transition-all w-fit">
                    <Upload size={14} /> Upload Logo
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoSelect} />
                  </label>
                  <p className="text-gray-600 text-xs">or enter URL below</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Partner Name *</label>
                <input
                  type="text"
                  placeholder="Partner name"
                  value={form.name}
                  onChange={e => setForm(p => ({...p, name: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                  style={{ fontFamily: 'var(--font-hind-siliguri)' }}
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Logo URL (Optional)</label>
                <input
                  type="url"
                  placeholder="Logo URL"
                  value={form.logo_url}
                  onChange={e => { setForm(p => ({...p, logo_url: e.target.value})); if (!logoFile) setLogoPreview(e.target.value); }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Website URL (Optional)</label>
                <input
                  type="url"
                  placeholder="Website URL (https://...)"
                  value={form.website_url}
                  onChange={e => setForm(p => ({...p, website_url: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Short Description</label>
                <input
                  type="text"
                  placeholder="Short description"
                  value={form.description}
                  onChange={e => setForm(p => ({...p, description: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                  style={{ fontFamily: 'var(--font-hind-siliguri)' }}
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Display Order</label>
                <input
                  type="number"
                  placeholder="Display order (1, 2, 3...)"
                  value={form.sort_order}
                  onChange={e => setForm(p => ({...p, sort_order: parseInt(e.target.value) || 0}))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
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
                disabled={uploadingLogo}
                className="flex-1 py-3 bg-[#2F2FE4] hover:bg-[#162E93] disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {uploadingLogo ? <><Loader2 size={14} className="animate-spin" /> Uploading...</> : <><Edit2 size={14} /> {editingPartner ? 'Update Partner' : 'Save Partner'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Partners List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-blue-400" />
        </div>
      ) : partners.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Building2 size={48} className="text-gray-600" />
          <p className="text-gray-500 font-medium">No partners added yet.</p>
          <button onClick={handleOpenAdd} className="flex items-center gap-2 px-5 py-2.5 bg-[#2F2FE4] text-white rounded-xl font-bold text-sm cursor-pointer">
            <Plus size={16} /> Add First Partner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {partners.map(partner => (
            <div 
              key={partner.id}
              className={`rounded-2xl p-5 border transition-all relative ${
                partner.is_active ? 'bg-[#0c0e1f] border-white/10' : 'bg-[#0c0e1f]/50 border-amber-500/20 opacity-75'
              }`}
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  partner.is_active ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {partner.is_active ? 'Visible' : 'Hidden'}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-4 pr-16">
                <div className="w-16 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {partner.logo_url ? (
                    <img src={partner.logo_url} alt={partner.name} className="w-full h-full object-contain p-2" />
                  ) : (
                    <Building2 size={20} className="text-gray-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-sm truncate" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>{partner.name}</h3>
                  <p className="text-gray-400 text-xs truncate" style={{ fontFamily: 'var(--font-hind-siliguri)' }}>{partner.description}</p>
                </div>
              </div>

              {partner.website_url && (
                <a href={partner.website_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-blue-400 text-xs hover:text-blue-300 transition-colors mb-4 truncate">
                  <Globe size={12} /> {partner.website_url.replace('https://', '')}
                </a>
              )}

              <div className="flex gap-2 pt-2 border-t border-white/10">
                <button
                  onClick={() => handleOpenEdit(partner)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all cursor-pointer"
                >
                  <Edit2 size={12} /> Edit
                </button>
                <button
                  onClick={() => handleToggleActive(partner)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    partner.is_active
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                      : 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20'
                  }`}
                  title={partner.is_active ? "Hide from homepage" : "Show on homepage"}
                >
                  {partner.is_active ? <EyeOff size={12} /> : <Eye size={12} />}
                  {partner.is_active ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => handleDelete(partner.id)}
                  className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                  title="Delete Partner"
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
