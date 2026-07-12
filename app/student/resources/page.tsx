"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ResourcesPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/student?tab=resources');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0f18]">
      <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
    </div>
  );
}
