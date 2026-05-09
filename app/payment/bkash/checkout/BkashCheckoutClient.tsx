'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Deep-link entry: starts a real bKash session then redirects to bkashURL.
 */
export default function BkashCheckoutClient() {
  const search = useSearchParams();
  const router = useRouter();
  const courseId = search.get('courseId');
  const slug = search.get('slug');
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      if (!courseId || Number.isNaN(Number(courseId))) {
        setError('Missing or invalid course.');
        return;
      }
      const token = localStorage.getItem('token');
      if (!token) {
        router.push(
          `/auth/login?redirect=${encodeURIComponent(`/payment/bkash/checkout?courseId=${courseId}&slug=${slug || ''}`)}`
        );
        return;
      }
      try {
        const response = await fetch('/api/student/payment/bkash/init', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ courseId: Number(courseId) })
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Could not start bKash');
        }
        if (data.bkashURL) {
          window.location.href = data.bkashURL;
          return;
        }
        throw new Error('No checkout URL from bKash');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed');
      }
    };
    run();
  }, [courseId, slug, router]);

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-6">
      <div className="max-w-xl w-full bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6 text-center">
        <h1 className="text-2xl font-bold">Redirecting to bKash…</h1>
        <p className="text-slate-400 text-sm">If nothing happens, check your connection and bKash env settings.</p>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="button"
          onClick={() => router.push(slug ? `/courses/${encodeURIComponent(slug)}/enroll` : '/courses')}
          className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold"
        >
          Back to enrollment
        </button>
      </div>
    </div>
  );
}
