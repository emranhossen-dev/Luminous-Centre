"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MentorProfilePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/mentor?tab=profile');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900">
      <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  );
}
