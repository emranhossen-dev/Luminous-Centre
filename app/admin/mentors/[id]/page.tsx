import React from 'react';
import { notFound } from 'next/navigation';
import pool from '@/lib/database';
import MentorDetailsClient from '@/components/admin/MentorDetailsClient';

export const dynamic = 'force-dynamic';

export default async function MentorDetailsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  
  try {
    const res = await pool.query('SELECT * FROM mentors WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (res.rows.length === 0) {
      return notFound();
    }
    const mentor = res.rows[0];

    // Format skills if it's stored as comma-separated string or array
    let skillsArray: string[] = [];
    if (mentor.skills) {
      if (Array.isArray(mentor.skills)) {
        skillsArray = mentor.skills;
      } else if (typeof mentor.skills === 'string') {
        skillsArray = mentor.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }

    const formattedMentor = {
      ...mentor,
      skills: skillsArray
    };

    // Fetch stats
    const statsRes = await pool.query(`
      SELECT 
        (SELECT COUNT(*)::int FROM courses WHERE mentor_id = $1) as courses,
        (SELECT COUNT(*)::int FROM quizzes WHERE mentor_id = $1) as quizzes,
        (SELECT COUNT(DISTINCT e.id)::int FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE c.mentor_id = $1) as students
    `, [id]);
    const stats = statsRes.rows[0];

    // Fetch assigned courses
    const coursesRes = await pool.query(
      'SELECT id, title, category, status, price, batch, thumbnail_url FROM courses WHERE mentor_id = $1 ORDER BY title ASC',
      [id]
    );
    const assignedCourses = coursesRes.rows;
    // Fetch all courses for drop down list
    const availableCoursesRes = await pool.query(
      'SELECT id, title, batch FROM courses ORDER BY title ASC'
    );
    const allCourses = availableCoursesRes.rows;

    return (
      <MentorDetailsClient
        initialMentor={formattedMentor}
        initialStats={stats}
        initialAssignedCourses={assignedCourses}
        allCourses={allCourses}
      />
    );
  } catch (error) {
    console.error('Failed to fetch mentor details:', error);
    return notFound();
  }
}
