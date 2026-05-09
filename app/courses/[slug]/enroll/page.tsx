'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type PaymentMethod = 'bkash' | 'manual';

export default function CourseEnrollPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [method, setMethod] = useState<PaymentMethod>('bkash');
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    payerName: '',
    payerMobile: '',
    paymentMobile: '',
    paymentMobileLast3: '',
    transactionId: ''
  });
  const manualPaymentNumber = process.env.NEXT_PUBLIC_MANUAL_BKASH_NUMBER || '01XXXXXXXXX';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push(`/auth/login?redirect=/courses/${slug}/enroll`);
      return;
    }
    fetchCourse();
  }, [router, slug]);

  const amountText = useMemo(() => {
    if (!course) return '';
    return `${course.current_price} ${course.currency || 'BDT'}`;
  }, [course]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${slug}`);
      if (!response.ok) {
        throw new Error('Course not found');
      }
      const data = await response.json();
      setCourse(data);
    } catch (error) {
      setMessage('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const startBkashPayment = async () => {
    if (!course?.id) return;
    setSubmitting(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/student/payment/bkash/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ courseId: Number(course.id) })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not start bKash');
      }
      if (data.bkashURL) {
        window.location.href = data.bkashURL;
        return;
      }
      throw new Error('bKash did not return a checkout URL');
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : 'Payment start failed');
    } finally {
      setSubmitting(false);
    }
  };

  const submitManualPayment = async () => {
    setSubmitting(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/student/payment/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId: Number(course.id),
          ...form
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Submission failed');
      }
      setMessage('Manual payment request submitted. Please wait for admin approval.');
    } catch (error: any) {
      setMessage(error.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">Loading...</div>;
  }

  if (!course) {
    return <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">Course not found.</div>;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
          <p className="text-slate-300">Complete payment to enroll in this course.</p>
          <p className="text-2xl font-black mt-4">{amountText}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setMethod('bkash')}
            className={`px-4 py-2 rounded-xl font-semibold ${method === 'bkash' ? 'bg-blue-600' : 'bg-white/10'}`}
          >
            bKash Payment
          </button>
          <button
            onClick={() => setMethod('manual')}
            className={`px-4 py-2 rounded-xl font-semibold ${method === 'manual' ? 'bg-blue-600' : 'bg-white/10'}`}
          >
            Manual Payment
          </button>
        </div>

        {method === 'bkash' ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <p className="text-slate-300">
              You will be sent to the real bKash payment page (sandbox). Use a test wallet, PIN{' '}
              <span className="text-white font-mono">12121</span>, OTP{' '}
              <span className="text-white font-mono">123456</span> in sandbox.
            </p>
            <button
              type="button"
              disabled={!course?.id || submitting}
              onClick={startBkashPayment}
              className="w-full bg-pink-600 hover:bg-pink-500 py-3 rounded-xl font-bold disabled:opacity-50"
            >
              {submitting ? 'Connecting to bKash…' : 'Pay with bKash'}
            </button>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <p className="text-slate-300">
              Send the course fee to this number first: <span className="font-black text-white">{manualPaymentNumber}</span>
            </p>
            <input
              className="w-full bg-[#0b1220] border border-white/10 rounded-lg px-4 py-3"
              placeholder="Your Name"
              value={form.payerName}
              onChange={(e) => setForm({ ...form, payerName: e.target.value })}
            />
            <input
              className="w-full bg-[#0b1220] border border-white/10 rounded-lg px-4 py-3"
              placeholder="Your Mobile Number"
              value={form.payerMobile}
              onChange={(e) => setForm({ ...form, payerMobile: e.target.value })}
            />
            <input
              className="w-full bg-[#0b1220] border border-white/10 rounded-lg px-4 py-3"
              placeholder="Payment Mobile Number"
              value={form.paymentMobile}
              onChange={(e) => setForm({ ...form, paymentMobile: e.target.value })}
            />
            <input
              className="w-full bg-[#0b1220] border border-white/10 rounded-lg px-4 py-3"
              placeholder="Payment Mobile Last 3 Digits"
              value={form.paymentMobileLast3}
              onChange={(e) => setForm({ ...form, paymentMobileLast3: e.target.value })}
            />
            <input
              className="w-full bg-[#0b1220] border border-white/10 rounded-lg px-4 py-3"
              placeholder="Transaction ID"
              value={form.transactionId}
              onChange={(e) => setForm({ ...form, transactionId: e.target.value })}
            />
            <button
              disabled={submitting}
              onClick={submitManualPayment}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 py-3 rounded-xl font-bold"
            >
              {submitting ? 'Submitting...' : 'Submit for Admin Approval'}
            </button>
          </div>
        )}

        {message && <p className="text-center text-sm text-blue-300">{message}</p>}
      </div>
    </div>
  );
}
