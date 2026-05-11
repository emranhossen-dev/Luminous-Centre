"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CategorySwitcherProps {
  currentCategory?: string;
}

export default function CategorySwitcher({ currentCategory }: CategorySwitcherProps) {
  const router = useRouter();

  const categories = [
    { id: 'all', label: 'All Courses', href: '/courses' },
    { id: 'online', label: 'Online', href: '/courses/online' },
    { id: 'offline', label: 'Offline', href: '/courses/offline' },
    { id: 'recorded', label: 'Recorded', href: '/courses/recorded' },
    { id: 'govt', label: 'Govt Free', href: '/courses/govt' }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-3 mb-12">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={category.href}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
            currentCategory === category.id
              ? "bg-[#2F2FE4] text-white shadow-lg shadow-[#2F2FE4]/25"
              : "bg-slate-800/50 border border-white/5 text-gray-300 hover:border-[#2F2FE4]/30 hover:bg-slate-800/70"
          }`}
        >
          {category.label}
        </Link>
      ))}
    </div>
  );
}
