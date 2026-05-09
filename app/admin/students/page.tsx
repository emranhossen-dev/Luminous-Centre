"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface EnrollmentRow {
  enrollment_id: number;
  enrollment_date: string;
  enrollment_status: string;
  completion_percentage: string | number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  course_id: number;
  course_title: string;
  course_slug: string;
}

export default function StudentsPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/admin/enrollments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to load enrollments');
        }
        const data = await res.json();
        setEnrollments(data.enrollments || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Enrolled students</h2>
          <p className="text-gray-500 font-medium">
            Everyone with an active row in <code className="text-xs bg-gray-100 px-1 rounded">enrollments</code> (after bKash success or manual approval).
          </p>
        </div>
        <Link
          href="/admin/dashboard"
          className="text-sm font-bold text-blue-600 hover:underline"
        >
          Pending payment requests → Dashboard
        </Link>
      </div>

      {loading && (
        <div className="p-12 text-center bg-white rounded-[40px] border border-gray-100 text-gray-500 font-medium">
          Loading enrollments…
        </div>
      )}

      {error && !loading && (
        <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      {!loading && !error && enrollments.length === 0 && (
        <div className="p-12 text-center bg-white rounded-[40px] border border-dashed border-gray-200 text-gray-400 font-bold">
          No enrollments yet.
        </div>
      )}

      {!loading && !error && enrollments.length > 0 && (
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-bold text-gray-700">Student</th>
                  <th className="px-6 py-4 font-bold text-gray-700">Course</th>
                  <th className="px-6 py-4 font-bold text-gray-700">Enrolled</th>
                  <th className="px-6 py-4 font-bold text-gray-700">Status</th>
                  <th className="px-6 py-4 font-bold text-gray-700">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {enrollments.map((row) => (
                  <tr key={row.enrollment_id} className="hover:bg-gray-50/80">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">
                        {row.first_name} {row.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{row.email}</p>
                      {row.phone && (
                        <p className="text-xs text-gray-400">{row.phone}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">{row.course_title}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {row.enrollment_date
                        ? new Date(row.enrollment_date).toLocaleString()
                        : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 capitalize">
                        {row.enrollment_status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {Number(row.completion_percentage || 0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
