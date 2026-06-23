import React from 'react';
import Link from 'next/link';
import { Search, Plus, Filter, MoreVertical, Edit, Trash2, Eye, Clock, FileText } from 'lucide-react';
import pool from '@/lib/database';

export const dynamic = 'force-dynamic';

export default async function QuizzesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = Number(searchParams.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  
  const search = typeof searchParams.search === 'string' ? searchParams.search : '';
  const statusFilter = typeof searchParams.status === 'string' ? searchParams.status : '';

  // Build query
  let queryStr = `
    SELECT q.*, c.title as course_title, m.name as mentor_name,
    (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) as total_questions,
    (SELECT COUNT(*) FROM quiz_attempts WHERE quiz_id = q.id) as total_attempts
    FROM quizzes q
    LEFT JOIN courses c ON q.course_id = c.id
    LEFT JOIN mentors m ON q.mentor_id = m.id
    WHERE 1=1
  `;
  const queryParams: any[] = [];
  let paramIndex = 1;

  if (search) {
    queryStr += ` AND (q.title ILIKE $${paramIndex} OR c.title ILIKE $${paramIndex})`;
    queryParams.push(`%${search}%`);
    paramIndex++;
  }

  if (statusFilter) {
    queryStr += ` AND q.status = $${paramIndex}`;
    queryParams.push(statusFilter);
    paramIndex++;
  }

  const countQuery = `SELECT COUNT(*) FROM (${queryStr}) AS count_tbl`;
  const countRes = await pool.query(countQuery, queryParams);
  const total = parseInt(countRes.rows[0].count, 10);
  const totalPages = Math.ceil(total / limit);

  queryStr += ` ORDER BY q.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  queryParams.push(limit, offset);

  let quizzes = [];
  try {
    const res = await pool.query(queryStr, queryParams);
    quizzes = res.rows;
  } catch (e) {
    console.error('Failed to fetch quizzes', e);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Quizzes</h1>
        <div className="flex gap-2">
          <Link 
            href="/admin/quizzes/bulk-upload"
            className="bg-gray-100 text-gray-700 hover:bg-gray-200 inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 transition-colors"
          >
            Bulk Upload
          </Link>
          <Link 
            href="/admin/quizzes/builder"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-blue-600 text-white transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Quiz
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
        <form className="flex w-full sm:w-auto gap-4 items-center" method="GET">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search quizzes or courses..."
              className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 pl-9 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select 
            name="status" 
            defaultValue={statusFilter}
            className="h-10 rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <button type="submit" className="h-10 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors">
            Filter
          </button>
        </form>
      </div>

      <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b">
            <tr>
              <th className="px-6 py-4">Quiz Details</th>
              <th className="px-6 py-4">Course</th>
              <th className="px-6 py-4">Mentor</th>
              <th className="px-6 py-4">Stats</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {quizzes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No quizzes found.
                </td>
              </tr>
            ) : (
              quizzes.map((quiz) => (
                <tr key={quiz.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{quiz.title}</div>
                        <div className="text-gray-500 text-xs flex items-center gap-2 mt-1">
                          <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> {quiz.duration} mins</span>
                          <span>| Pass: {quiz.passing_score}%</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {quiz.course_title || <span className="text-gray-400 italic">Independent Quiz</span>}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {quiz.mentor_name || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Questions: <span className="font-medium text-gray-900">{quiz.total_questions}</span></div>
                      <div>Attempts: <span className="font-medium text-gray-900">{quiz.total_attempts}</span></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      quiz.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {quiz.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/quizzes/builder?id=${quiz.id}`} className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
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
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(page * limit, total)}</span> of <span className="font-medium">{total}</span> results
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link 
                href={`?page=${page - 1}&search=${search}&status=${statusFilter}`}
                className="px-3 py-1 border rounded hover:bg-gray-50 text-sm"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link 
                href={`?page=${page + 1}&search=${search}&status=${statusFilter}`}
                className="px-3 py-1 border rounded hover:bg-gray-50 text-sm"
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
