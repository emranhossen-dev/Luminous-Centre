import React from 'react';
import Link from 'next/link';
import { Search, Plus, Filter, MoreVertical, Edit, Trash2, Eye, UserX, UserCheck } from 'lucide-react';
import pool from '@/lib/database';

export const dynamic = 'force-dynamic';

export default async function MentorsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = Number(searchParams.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  
  const search = typeof searchParams.search === 'string' ? searchParams.search : '';
  const statusFilter = typeof searchParams.status === 'string' ? searchParams.status : '';
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'created_at';
  const order = sort === 'rating' ? 'DESC' : 'DESC'; // Example sorting logic

  // Build query
  let queryStr = `SELECT * FROM mentors WHERE deleted_at IS NULL`;
  const queryParams: any[] = [];
  let paramIndex = 1;

  if (search) {
    queryStr += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
    queryParams.push(`%${search}%`);
    paramIndex++;
  }

  if (statusFilter) {
    queryStr += ` AND status = $${paramIndex}`;
    queryParams.push(statusFilter);
    paramIndex++;
  }

  // Count total for pagination
  const countQuery = `SELECT COUNT(*) FROM (${queryStr}) AS count_tbl`;
  const countRes = await pool.query(countQuery, queryParams);
  const total = parseInt(countRes.rows[0].count, 10);
  const totalPages = Math.ceil(total / limit);

  // Add sorting and pagination
  queryStr += ` ORDER BY ${sort} ${order} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  queryParams.push(limit, offset);

  let mentors = [];
  try {
    const res = await pool.query(queryStr, queryParams);
    mentors = res.rows;
  } catch (e) {
    console.error('Failed to fetch mentors', e);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Mentors</h1>
        <Link 
          href="/admin/mentors/add"
          className="bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 transition-colors shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Mentor
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm">
        <form className="flex w-full sm:w-auto gap-4 items-center" method="GET">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-slate-400" />
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search mentors..."
              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 pl-9 text-sm placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>
          
          <select 
            name="status" 
            defaultValue={statusFilter}
            className="h-10 rounded-md border border-gray-300 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-slate-100"
          >
            <option value="" className="dark:bg-slate-900">All Statuses</option>
            <option value="active" className="dark:bg-slate-900">Active</option>
            <option value="suspended" className="dark:bg-slate-900">Suspended</option>
          </select>

          <select 
            name="sort" 
            defaultValue={sort}
            className="h-10 rounded-md border border-gray-300 dark:border-slate-800 bg-transparent dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-slate-100"
          >
            <option value="created_at" className="dark:bg-slate-900">Join Date</option>
            <option value="rating" className="dark:bg-slate-900">Rating</option>
          </select>

          <button type="submit" className="h-10 px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-md text-sm font-medium transition-colors">
            Apply
          </button>
        </form>
      </div>

      <div className="border border-gray-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden bg-white dark:bg-slate-900">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-600 dark:text-slate-300 font-medium border-b border-gray-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4">Mentor</th>
              <th className="px-6 py-4">Expertise</th>
              <th className="px-6 py-4">Students</th>
              <th className="px-6 py-4">Rating</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
            {mentors.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-slate-400">
                  No mentors found.
                </td>
              </tr>
            ) : (
              mentors.map((mentor) => (
                <tr key={mentor.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 border-b border-gray-100 dark:border-slate-800 last:border-none transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
                        {mentor.avatar ? (
                          <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-gray-500 dark:text-slate-400 font-medium">{mentor.name.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{mentor.name}</div>
                        <div className="text-gray-500 dark:text-slate-400 text-xs">{mentor.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-slate-400">
                    {mentor.designation || '-'}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-slate-200">
                    {mentor.total_students}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-yellow-500">
                      ★ <span className="text-gray-700 dark:text-slate-300">{mentor.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      mentor.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {mentor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/admin/mentors/${mentor.id}`} 
                        className="p-2 text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors" 
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button 
                        className="p-2 text-gray-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-md transition-colors" 
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors" 
                        title="Delete"
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Showing <span className="font-medium dark:text-slate-200">{(page - 1) * limit + 1}</span> to <span className="font-medium dark:text-slate-200">{Math.min(page * limit, total)}</span> of <span className="font-medium dark:text-slate-200">{total}</span> results
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link 
                href={`?page=${page - 1}&search=${search}&status=${statusFilter}&sort=${sort}`}
                className="px-3 py-1 border border-gray-200 dark:border-slate-800 rounded hover:bg-gray-50 dark:hover:bg-slate-800/50 text-gray-700 dark:text-slate-300 text-sm transition-colors"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link 
                href={`?page=${page + 1}&search=${search}&status=${statusFilter}&sort=${sort}`}
                className="px-3 py-1 border border-gray-200 dark:border-slate-800 rounded hover:bg-gray-50 dark:hover:bg-slate-800/50 text-gray-700 dark:text-slate-300 text-sm transition-colors"
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
