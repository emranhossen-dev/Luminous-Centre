'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import BestSpinner from '@/components/BestSpinner';

export default function RedirectToCourseEnroll() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  useEffect(() => {
    if (slug) {
      router.replace(`/courses/${slug}?enroll=true`);
    } else {
      router.replace('/courses');
    }
  }, [slug, router]);

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <BestSpinner size="large" color="#ffffff" />
    </div>
  );
}
