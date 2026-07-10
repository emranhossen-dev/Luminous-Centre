'use client';

import React, { useEffect, useState } from 'react';
import { Search, Plus, Filter, Edit, Trash2, UserX, UserCheck, Shield, Key, Eye } from 'lucide-react';
import { getStaffList, getRoles, toggleStaffStatus, deleteStaff } from './actions';
import StaffModal from '@/components/admin/StaffModal';
import { toast } from 'react-toastify';

export default function StaffPage() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [staffRes, rolesRes] = await Promise.all([getStaffList(), getRoles()]);
      if (staffRes.success) {
        setStaffList(staffRes.staff || []);
      } else {
        toast.error('Failed to load staff list');
      }

      if (rolesRes.success) {
        setRoles(rolesRes.roles || []);
      } else {
        toast.error('Failed to load system roles');
      }
    } catch (e) {
      toast.error('An error occurred loading staff records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const res = await toggleStaffStatus(id, currentStatus);
      if (res.success) {
        toast.success(currentStatus ? 'Staff deactivated successfully' : 'Staff activated successfully');
        loadData();
      } else {
        toast.error(res.error || 'Failed to toggle staff status');
      }
    } catch (e) {
      toast.error('Error toggling staff status');
    }
  };

  const handleDeleteStaff = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this staff member? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await deleteStaff(id);
      if (res.success) {
        toast.success('Staff member deleted successfully');
        loadData();
      } else {
        toast.error(res.error || 'Failed to delete staff member');
      }
    } catch (e) {
      toast.error('Error deleting staff member');
    }
  };

  const handleEditStaff = (staffMember: any) => {
    setEditingStaff(staffMember);
    setIsModalOpen(true);
  };

  const handleAddStaff = () => {
    setEditingStaff(null);
    setIsModalOpen(true);
  };

  // Filter staff list
  const filteredStaff = staffList.filter(member => {
    const fullName = `${member.firstName || ''} ${member.lastName || ''}`.toLowerCase();
    const email = (member.email || '').toLowerCase();
    const searchMatch = fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
    const roleMatch = roleFilter === '' || member.roleName === roleFilter;
    
    let statusMatch = true;
    if (statusFilter === 'active') statusMatch = member.isActive === true;
    if (statusFilter === 'inactive') statusMatch = member.isActive === false;

    return searchMatch && roleMatch && statusMatch;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Staff Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage system administrators, managers, mendor instructors, and office employees.
          </p>
        </div>
        <button 
          onClick={handleAddStaff}
          className="bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center justify-center rounded-xl text-sm font-semibold h-11 px-5 py-2 transition-all shadow-md hover:shadow-blue-500/20 active:scale-95"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Staff Member
        </button>
      </div>

      {/* Filters Area */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap w-full md:w-auto gap-3 items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff by name or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 pl-9 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            />
          </div>
          
          <select 
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-300"
          >
            <option value="">All Roles</option>
            {roles.map(role => (
              <option key={role.id} value={role.name}>
                {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
              </option>
            ))}
          </select>

          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-300"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        <button 
          onClick={loadData}
          className="h-10 w-full md:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-colors"
        >
          Reset List
        </button>
      </div>

      {/* Staff Table */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading staff directory...</p>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-16 text-center text-slate-500 dark:text-slate-400 space-y-2">
            <Shield className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="font-bold text-slate-700 dark:text-slate-300">No staff members found</p>
            <p className="text-xs">Adjust your search parameters or register a new staff member.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-850">
                <tr>
                  <th className="px-6 py-4">Staff Member</th>
                  <th className="px-6 py-4">Designation</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Active Modules / Permissions</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredStaff.map((member) => {
                  let perms = member.permissions || [];
                  if (typeof perms === 'string') {
                    try { perms = JSON.parse(perms); } catch { perms = []; }
                  }
                  
                  return (
                    <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 border-b border-slate-100 dark:border-slate-800 last:border-none transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-200/50 dark:border-slate-800">
                            <span className="text-slate-600 dark:text-slate-300 font-bold text-sm">
                              {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {member.firstName} {member.lastName}
                            </div>
                            <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                        {member.designation || <span className="text-slate-400 dark:text-slate-600 italic">No Title</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border ${
                          member.roleName === 'admin' 
                            ? 'bg-rose-100/50 text-rose-800 border-rose-200/50 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30' 
                            : member.roleName === 'manager'
                            ? 'bg-purple-100/50 text-purple-800 border-purple-200/50 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30'
                            : member.roleName === 'mentor'
                            ? 'bg-amber-100/50 text-amber-800 border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
                            : 'bg-blue-100/50 text-blue-800 border-blue-200/50 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30'
                        }`}>
                          {member.roleName}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {perms.includes('*') ? (
                            <span className="inline-flex text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                              Full Access (*)
                            </span>
                          ) : perms.length === 0 ? (
                            <span className="inline-flex text-[10px] font-semibold bg-slate-500/10 text-slate-500 px-1.5 py-0.5 rounded-md border border-slate-500/20 italic">
                              No Specific Permission
                            </span>
                          ) : (
                            perms.slice(0, 4).map((p: string) => (
                              <span key={p} className="inline-flex text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-850">
                                {p}
                              </span>
                            ))
                          )}
                          {perms.length > 4 && !perms.includes('*') && (
                            <span className="inline-flex text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-md">
                              +{perms.length - 4} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleToggleStatus(member.id, member.isActive)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                            member.isActive 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' 
                              : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700/60'
                          }`}
                          title={member.isActive ? 'Click to Deactivate' : 'Click to Activate'}
                        >
                          {member.isActive ? (
                            <>
                              <UserCheck className="w-3.5 h-3.5" /> Active
                            </>
                          ) : (
                            <>
                              <UserX className="w-3.5 h-3.5" /> Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEditStaff(member)}
                            className="p-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all" 
                            title="Edit Permissions & Details"
                          >
                            <Edit className="w-4.5 h-4.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteStaff(member.id)}
                            className="p-2 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all" 
                            title="Remove Member"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reusable Modal Form */}
      <StaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        staff={editingStaff}
        roles={roles}
        onSuccess={loadData}
      />
    </div>
  );
}
