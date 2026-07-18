import React from 'react';
import Link from 'next/link';
import { Search, Download } from 'lucide-react';
import pool from '@/lib/database';
import StudentRowActions from '@/components/admin/StudentRowActions';

export const dynamic = 'force-dynamic';

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = Number(searchParams.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  
  const search = typeof searchParams.search === 'string' ? searchParams.search : '';
  const statusFilter = typeof searchParams.status === 'string' ? searchParams.status : '';

  // 1. Fetch mentors for actions dropdown
  const mentorsRes = await pool.query('SELECT id, name FROM mentors ORDER BY name');
  const allMentors = mentorsRes.rows.map(m => ({ id: m.id, name: m.name }));

  // 2. Build query
  let queryStr = `
    SELECT s.*, m.name as mentor_name, u.id as user_id
    FROM students s
    LEFT JOIN mentors m ON s.mentor_id = m.id
    LEFT JOIN users u ON LOWER(u.email) = LOWER(s.email)
    WHERE s.deleted_at IS NULL
  `;
  const queryParams: any[] = [];
  let paramIndex = 1;

  if (search) {
    queryStr += ` AND (s.name ILIKE $${paramIndex} OR s.email ILIKE $${paramIndex})`;
    queryParams.push(`%${search}%`);
    paramIndex++;
  }

  if (statusFilter) {
    queryStr += ` AND s.status = $${paramIndex}`;
    queryParams.push(statusFilter);
    paramIndex++;
  }

  const countQuery = `SELECT COUNT(*) FROM (${queryStr}) AS count_tbl`;
  const countRes = await pool.query(countQuery, queryParams);
  const total = parseInt(countRes.rows[0].count, 10);
  const totalPages = Math.ceil(total / limit);

  queryStr += ` ORDER BY s.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  queryParams.push(limit, offset);

  let students = [];
  try {
    const res = await pool.query(queryStr, queryParams);
    students = res.rows;
  } catch (e) {
    console.error('Failed to fetch students', e);
  }

  return (
    <div className="p-6 space-y-6 text-slate-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Student Management</h1>
          <p className="text-xs text-slate-400 mt-1">Manage registered students, course enrollments, and assigned mentors.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 inline-flex items-center justify-center rounded-xl text-sm font-semibold h-10 px-4 py-2 transition-all cursor-pointer">
            <Download className="mr-2 h-4 w-4 text-blue-400" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 shadow-xl">
        <form className="flex w-full sm:w-auto gap-4 items-center" method="GET">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search students..."
              className="flex h-10 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 pl-10 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500 transition-all"
            />
          </div>
          
          <select 
            name="status" 
            defaultValue={statusFilter}
            className="h-10 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-300 outline-none focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>

          <button type="submit" className="h-10 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer">
            Filter
          </button>
        </form>
      </div>

      {/* Students Table */}
      <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm shadow-xl">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-white/5 text-slate-300 font-bold border-b border-white/10">
            <tr>
              <th className="px-6 py-4 w-12"><input type="checkbox" className="rounded border-white/10 bg-slate-950 checked:bg-blue-600 transition-all" /></th>
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Department / Designation</th>
              <th className="px-6 py-4">Assigned Mentor</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {students.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  No student records found in the database.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="hover:bg-white/5 transition-all">
                  <td className="px-6 py-4"><input type="checkbox" className="rounded border-white/10 bg-slate-950 checked:bg-blue-600" /></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 overflow-hidden flex items-center justify-center font-bold text-base shadow-inner shrink-0">
                        {student.avatar ? (
                          <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                        ) : (
                          student.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-white truncate">{student.name}</div>
                        <div className="text-slate-400 text-xs truncate mt-0.5">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-300">{student.department || '-'}</div>
                    {student.designation && <div className="text-slate-500 text-xs mt-0.5">{student.designation}</div>}
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {student.mentor_name ? (
                      <span className="inline-flex items-center px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs font-semibold text-indigo-400">
                        {student.mentor_name}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 border rounded-full text-xs font-bold ${
                      student.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                      student.status === 'suspended' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 
                      'bg-slate-500/10 border-slate-500/20 text-slate-400'
                    }`}>
                      {student.status ? student.status.toUpperCase() : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <StudentRowActions student={student} allMentors={allMentors} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-slate-400">
            Showing <span className="font-medium text-slate-200">{(page - 1) * limit + 1}</span> to <span className="font-medium text-slate-200">{Math.min(page * limit, total)}</span> of <span className="font-medium text-slate-200">{total}</span> results
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link 
                href={`?page=${page - 1}&search=${search}&status=${statusFilter}`}
                className="px-4 py-2 border border-white/10 rounded-xl hover:bg-white/5 text-sm font-semibold transition-all text-slate-300"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link 
                href={`?page=${page + 1}&search=${search}&status=${statusFilter}`}
                className="px-4 py-2 border border-white/10 rounded-xl hover:bg-white/5 text-sm font-semibold transition-all text-slate-300"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
