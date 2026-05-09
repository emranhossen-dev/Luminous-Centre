'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function FailedContent() {
  const sp = useSearchParams();
  const reason = sp.get('reason') || 'unknown';
  const paymentID = sp.get('paymentID');

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-6">
      <div className="max-w-lg w-full bg-white/5 border border-white/10 rounded-2xl p-8 space-y-4 text-center">
        <h1 className="text-2xl font-bold">Payment did not complete</h1>
        <p className="text-slate-400 text-sm">
          Reason: <span className="text-slate-200 font-mono">{reason}</span>
        </p>
        {paymentID && (
          <p className="text-xs text-slate-500 font-mono break-all">Payment ID: {paymentID}</p>
        )}
        <div className="flex flex-col gap-2 pt-4">
          <Link
            href="/courses"
            className="py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-center"
          >
            Back to courses
          </Link>
          <Link href="/student" className="py-3 rounded-xl bg-white/10 hover:bg-white/20 font-semibold text-center">
            Student home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BkashFailedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">Loading…</div>}>
      <FailedContent />
    </Suspense>
  );
}
