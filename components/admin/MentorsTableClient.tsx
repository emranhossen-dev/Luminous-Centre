'use client';

import React, { useState } from 'react';
import { Edit, Trash2, Eye, Star } from 'lucide-react';
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
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
      <div className="overflow-x-auto w-full max-w-full">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/5 text-gray-300 font-medium border-b border-white/10">
            <tr>
              <th className="px-6 py-4">Mentor</th>
              <th className="px-6 py-4">Expertise</th>
              <th className="px-6 py-4">Students</th>
              <th className="px-6 py-4">Rating</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {mentors.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 bg-transparent">
                  No mentors found.
                </td>
              </tr>
            ) : (
              mentors.map((mentor) => (
                <tr key={mentor.id} className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-none">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center border border-white/10 flex-shrink-0">
                        {mentor.avatar ? (
                          <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white font-bold">{mentor.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-white truncate max-w-[160px]" title={mentor.name}>
                          {mentor.name}
                        </div>
                        <div className="text-gray-400 text-xs truncate max-w-[180px]" title={mentor.email}>
                          {mentor.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300 font-medium">
                    {mentor.designation || '-'}
                  </td>
                  <td className="px-6 py-4 text-white font-semibold">
                    {mentor.total_students || 0}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-yellow-500 font-bold">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500 flex-shrink-0" />
                      <span className="text-gray-200">{mentor.rating || '5.0'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                      mentor.status === 'active' 
                        ? 'bg-green-600/20 text-green-400 border border-green-500/20' 
                        : 'bg-red-650/20 text-red-400 border border-red-500/20'
                    }`}>
                      {mentor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/admin/mentors/${mentor.id}`} 
                        className="p-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/20 rounded-lg text-blue-400 transition-colors" 
                        title="View Profile Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleEdit(mentor)}
                        className="p-2 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-600/20 rounded-lg text-yellow-400 transition-colors cursor-pointer" 
                        title="Edit Mentor"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(mentor.id, mentor.name)}
                        className="p-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/20 rounded-lg text-red-400 transition-colors cursor-pointer" 
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
      </div>

      <MentorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mentor={selectedMentor}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
