'use client';

import React, { useEffect, useState } from 'react';
import { X, Save, ShieldAlert, Key } from 'lucide-react';
import { StaffData, createStaff, updateStaff } from '@/app/admin/staff/actions';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { menuItems } from '@/lib/admin-menu';

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
}

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: any | null; // Null when adding, user data when editing
  roles: Role[];
  onSuccess: () => void;
}

export default function StaffModal({ isOpen, onClose, staff, roles, onSuccess }: StaffModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState<number>(0);
  const [designation, setDesignation] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customized, setCustomized] = useState(false); // Triggers warning if user changes default permissions

  // Populate data when modal opens or staff changes
  useEffect(() => {
    if (staff) {
      setFirstName(staff.firstName || '');
      setLastName(staff.lastName || '');
      setEmail(staff.email || '');
      setPhone(staff.phone || '');
      setPassword(''); // Clear password field for editing
      setRoleId(staff.roleId || (roles[0]?.id || 0));
      setDesignation(staff.designation || '');
      
      let perms = staff.permissions || [];
      if (typeof perms === 'string') {
        try { perms = JSON.parse(perms); } catch { perms = []; }
      }
      setSelectedPermissions(perms);
      setCustomized(true);
    } else {
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setPassword('');
      const defaultRole = roles.find(r => r.name === 'mentor') || roles[0];
      setRoleId(defaultRole?.id || 0);
      setDesignation('');
      setSelectedPermissions(defaultRole?.permissions || []);
      setCustomized(false);
    }
  }, [staff, isOpen, roles]);

  // Update permissions checklist when role changes (if not custom edited)
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(e.target.value);
    setRoleId(selectedId);
    
    // Auto populate default permissions for the chosen role
    const roleObj = roles.find(r => r.id === selectedId);
    if (roleObj) {
      let defaultPerms = roleObj.permissions;
      if (typeof defaultPerms === 'string') {
        try { defaultPerms = JSON.parse(defaultPerms); } catch { defaultPerms = []; }
      }
      setSelectedPermissions(defaultPerms);
      setCustomized(false);
    }
  };

  const handlePermissionToggle = (permKey: string) => {
    setCustomized(true);
    setSelectedPermissions(prev => 
      prev.includes(permKey) 
        ? prev.filter(k => k !== permKey) 
        : [...prev, permKey]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) {
      toast.error('First Name, Last Name, and Email are required');
      return;
    }

    if (!staff && !password) {
      toast.error('Password is required for new staff members');
      return;
    }

    setIsSubmitting(true);
    try {
      const data: StaffData = {
        firstName,
        lastName,
        email,
        phone,
        password: password || undefined,
        roleId,
        designation,
        permissions: selectedPermissions,
        isActive: staff ? staff.isActive : true
      };

      const result = staff 
        ? await updateStaff(staff.id, data)
        : await createStaff(data);

      if (result.success) {
        toast.success(staff ? 'Staff updated successfully!' : 'Staff created successfully!');
        onSuccess();
        onClose();
      } else {
        toast.error(result.error || 'Failed to save staff');
      }
    } catch (err: any) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden z-10"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {staff ? 'Edit Staff Member' : 'Add New Staff Member'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {staff ? 'Update registration and modify permissions' : 'Create a new staff credential and assign modules'}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Account fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">First Name *</label>
                  <input 
                    type="text"
                    required
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                    placeholder="e.g. Imran"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Last Name *</label>
                  <input 
                    type="text"
                    required
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                    placeholder="e.g. Hossen"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Email Address *</label>
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                    placeholder="e.g. staff@luminous.com"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Phone Number</label>
                  <input 
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                    placeholder="e.g. +88017XXXXXXXX"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {staff ? 'New Password (Optional)' : 'Password *'}
                  </label>
                  <div className="relative">
                    <input 
                      type="password"
                      required={!staff}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                      placeholder={staff ? 'Leave blank to keep current' : '••••••••'}
                    />
                    <Key className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Role *</label>
                  <select 
                    value={roleId}
                    onChange={handleRoleChange}
                    className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.id} className="dark:bg-slate-900">
                        {role.name.charAt(0).toUpperCase() + role.name.slice(1)} ({role.description})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Designation (Job Title)</label>
                  <input 
                    type="text"
                    value={designation}
                    onChange={e => setDesignation(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                    placeholder="e.g. Senior Instructor / Coordinator / Assistant Manager"
                  />
                </div>
              </div>

              {/* Permissions Checklist Section */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Modules Permission Checklist</h3>
                  {customized && (
                    <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-semibold inline-flex items-center gap-1 border border-amber-500/20">
                      <ShieldAlert className="w-3 h-3" /> Customized permissions
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Select what this staff member can view or modify. Overrides default role permissions.
                </p>

                <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* All Permissions (*) option */}
                    <label className="flex items-start gap-2.5 text-sm cursor-pointer p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition select-none sm:col-span-2">
                      <input 
                        type="checkbox"
                        checked={selectedPermissions.includes('*')}
                        onChange={() => handlePermissionToggle('*')}
                        className="rounded border-slate-300 dark:border-slate-800 text-emerald-600 focus:ring-emerald-500 mt-1"
                      />
                      <div>
                        <span className="text-slate-900 dark:text-white text-xs font-bold block">
                          Full Administrator Access (*)
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          Grants unrestricted access to all current and future admin modules.
                        </span>
                      </div>
                    </label>

                    {/* Dynamic customizable modules checkboxes */}
                    {menuItems.filter(item => item.id !== 'dashboard').map(item => (
                      <label 
                        key={item.id} 
                        className={`flex items-start gap-2.5 text-sm cursor-pointer p-2.5 rounded-xl border transition select-none ${
                          selectedPermissions.includes('*') 
                            ? 'border-slate-100 dark:border-slate-800/40 bg-slate-100/50 opacity-60 cursor-not-allowed' 
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-blue-500/30 hover:bg-blue-500/5'
                        }`}
                      >
                        <input 
                          type="checkbox"
                          checked={selectedPermissions.includes(item.id) || selectedPermissions.includes('*')}
                          disabled={selectedPermissions.includes('*')}
                          onChange={() => handlePermissionToggle(item.id)}
                          className="rounded border-slate-300 dark:border-slate-800 text-blue-600 focus:ring-blue-500 mt-0.5"
                        />
                        <div>
                          <span className="text-slate-800 dark:text-slate-200 text-xs font-bold block">
                            {item.label}
                          </span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            Permission to manage {item.label.toLowerCase()} panel.
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button"
                  onClick={onClose}
                  className="h-10 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="h-10 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors inline-flex items-center shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {staff ? 'Save Changes' : 'Register Staff'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
