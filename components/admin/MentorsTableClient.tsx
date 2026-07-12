'use client';

import React, { useState } from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { deleteMentor } from '@/app/admin/mentors/add/actions';
import MentorModal from './MentorModal';
import { useRouter } from 'next/navigation';

interface Mentor {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  designation?: string;
  experience?: string;
  bio?: string;
  skills?: any;
  linkedin?: string;
  github?: string;
  website?: string;
  status: string;
  rating?: number;
  total_students?: number;
}

interface MentorsTableClientProps {
  initialMentors: Mentor[];
}

export default function MentorsTableClient({ initialMentors }: MentorsTableClientProps) {
  const [mentors, setMentors] = useState<Mentor[]>(initialMentors);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleEdit = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setIsModalOpen(true);
  };

  const handleDelete = async (mentorId: number, name: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete mentor "${name}"? This will also remove their user account.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const actionResult = await deleteMentor(mentorId);
        if (actionResult.success) {
          Swal.fire({
            title: 'Deleted!',
            text: 'Mentor has been deleted.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
          setMentors(prev => prev.filter(m => m.id !== mentorId));
          router.refresh();
        } else {
          Swal.fire('Error!', actionResult.error || 'Failed to delete mentor.', 'error');
        }
      } catch (err) {
        Swal.fire('Error!', 'A network error occurred.', 'error');
      }
    }
  };

  const handleRefresh = () => {
    // Refresh the server-side router state to fetch updated lists
    router.refresh();
  };

  return (
    <div className="border border-gray-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden bg-white dark:bg-slate-900">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-600 dark:text-slate-300 font-medium border-b border-gray-200 dark:border-slate-800">
          <tr>
            <th className="px-6 py-4">Mentor</th>
            <th className="px-6 py-4">Expertise</th>
            <th className="px-6 py-4">Students</th>
            <th className="px-6 py-4">Rating</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
          {mentors.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-slate-400">
                No mentors found.
              </td>
            </tr>
          ) : (
            mentors.map((mentor) => (
              <tr key={mentor.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 border-b border-gray-100 dark:border-slate-800 last:border-none transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-250 dark:bg-slate-800 overflow-hidden flex items-center justify-center border border-gray-200 dark:border-slate-800">
                      {mentor.avatar ? (
                        <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-600 dark:text-slate-300 font-bold">{mentor.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">{mentor.name}</div>
                      <div className="text-gray-500 dark:text-slate-450 text-xs">{mentor.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-slate-400">
                  {mentor.designation || '-'}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-slate-200">
                  {mentor.total_students || 0}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-yellow-500 font-semibold">
                    ★ <span className="text-gray-700 dark:text-slate-300">{mentor.rating || '5.0'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                    mentor.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {mentor.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link 
                      href={`/admin/mentors/${mentor.id}`} 
                      className="p-2 text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors" 
                      title="View Profile Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => handleEdit(mentor)}
                      className="p-2 text-gray-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-md transition-colors cursor-pointer" 
                      title="Edit Mentor"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(mentor.id, mentor.name)}
                      className="p-2 text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors cursor-pointer" 
                      title="Delete Mentor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <MentorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mentor={selectedMentor}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
