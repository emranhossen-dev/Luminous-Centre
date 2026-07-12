import React from 'react';
import Link from 'next/link';
import { Search, Plus, Filter, MoreVertical, Edit, Trash2, Eye, UserX, UserCheck } from 'lucide-react';
import pool from '@/lib/database';
import MentorsTableClient from '@/components/admin/MentorsTableClient';

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

      <MentorsTableClient initialMentors={mentors} />

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
