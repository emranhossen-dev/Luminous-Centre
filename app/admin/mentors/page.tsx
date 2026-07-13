import React from 'react';
import Link from 'next/link';
import { Search, Plus, Filter, MoreVertical, Edit, Trash2, Eye, UserX, UserCheck, Users } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="p-3 bg-blue-600/20 rounded-xl">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            Mentors Management
          </h1>
          <p className="text-gray-400 mt-2">Manage and track course instructors</p>
        </div>
        <Link 
          href="/admin/mentors/add"
          className="bg-blue-600 hover:bg-blue-500 text-white inline-flex items-center justify-center rounded-xl text-sm font-bold h-11 px-5 transition-all shadow-lg hover:shadow-blue-500/20"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Mentor
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
        <form className="flex flex-col sm:flex-row w-full gap-4 items-center" method="GET">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search mentors..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
            />
          </div>
          
          <div className="flex flex-wrap w-full sm:w-auto gap-4 items-center">
            <div className="relative">
              <select 
                name="status" 
                defaultValue={statusFilter}
                className="appearance-none pl-4 pr-10 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent cursor-pointer text-sm"
              >
                <option value="" className="bg-gray-800">All Statuses</option>
                <option value="active" className="bg-gray-800">Active</option>
                <option value="suspended" className="bg-gray-800">Suspended</option>
                <option value="inactive" className="bg-gray-800">Inactive</option>
              </select>
            </div>

            <div className="relative">
              <select 
                name="sort" 
                defaultValue={sort}
                className="appearance-none pl-4 pr-10 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent cursor-pointer text-sm"
              >
                <option value="created_at" className="bg-gray-800">Join Date</option>
                <option value="rating" className="bg-gray-800">Rating</option>
              </select>
            </div>

            <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all cursor-pointer">
              Apply Filter
            </button>
          </div>
        </form>
      </div>

      <MentorsTableClient initialMentors={mentors} />

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <p className="text-sm text-gray-400">
            Showing <span className="font-semibold text-white">{(page - 1) * limit + 1}</span> to <span className="font-semibold text-white">{Math.min(page * limit, total)}</span> of <span className="font-semibold text-white">{total}</span> results
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link 
                href={`?page=${page - 1}&search=${search}&status=${statusFilter}&sort=${sort}`}
                className="px-4 py-2 border border-white/10 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white text-sm font-semibold transition"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link 
                href={`?page=${page + 1}&search=${search}&status=${statusFilter}&sort=${sort}`}
                className="px-4 py-2 border border-white/10 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white text-sm font-semibold transition"
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
