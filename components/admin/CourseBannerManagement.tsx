"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BannerRow } from '@/types/course-banner';
import CourseBannerCard from './CourseBannerCard';

interface CourseBannerManagementProps {
  onBannerSelect?: (banner: BannerRow) => void;
}

export default function CourseBannerManagement({ onBannerSelect }: CourseBannerManagementProps) {
  const [banners, setBanners] = useState<BannerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerRow | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/admin/course-banners', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch course banners');
      }

      const data = await response.json();
      setBanners(data.courseBanners || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch course banners');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBanner = async (formData: any) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/admin/course-banners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create course banner');
      }

      toast.success('Course banner created successfully! 🎉');
      setShowCreateForm(false);
      fetchBanners(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || 'Failed to create course banner');
    }
  };

  const handleUpdateBanner = async (id: string, formData: any) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/admin/course-banners/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update course banner');
      }

      toast.success('Course banner updated successfully! 🎉');
      setEditingBanner(null);
      fetchBanners(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || 'Failed to update course banner');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/admin/course-banners/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete course banner');
      }

      toast.success('Course banner deleted successfully! 🗑️');
      fetchBanners(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete course banner');
    }
  };

  const filteredBanners = banners.filter(banner =>
    banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    banner.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showCreateForm) {
    return (
      <CourseBannerCard
        onSubmit={handleCreateBanner}
        onClose={() => setShowCreateForm(false)}
      />
    );
  }

  if (editingBanner) {
    return (
      <CourseBannerCard
        initialData={editingBanner}
        onSubmit={(formData) => handleUpdateBanner(editingBanner.id!, formData)}
        onClose={() => setEditingBanner(null)}
      />
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Course Banner Management</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Create New Banner
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-purple-500/20">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search banners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-700 border border-purple-500/20 rounded-lg pl-10 pr-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
          <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Banners Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBanners.map((banner) => (
            <div
              key={banner.id}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-purple-500/20 overflow-hidden hover:border-purple-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 cursor-pointer"
              onClick={() => onBannerSelect?.(banner)}
            >
              <CourseBannerCard
                banner={banner}
                onUpdate={handleUpdateBanner}
                onDelete={handleDeleteBanner}
              />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredBanners.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-4">No course banners found</div>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first course banner to get started'}
          </p>
        </div>
      )}

      {/* Stats */}
      {!loading && banners.length > 0 && (
        <div className="mt-8 bg-slate-800 rounded-xl p-4 border border-purple-500/20">
          <div className="flex justify-around text-center">
            <div>
              <p className="text-2xl font-bold text-purple-400">{banners.length}</p>
              <p className="text-sm text-gray-400">Total Banners</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">
                {banners.filter(b => b.badge === 'Online Course').length}
              </p>
              <p className="text-sm text-gray-400">Online Courses</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">
                {banners.filter(b => b.badge === 'Offline Course').length}
              </p>
              <p className="text-sm text-gray-400">Offline Courses</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
