'use server';

import pool from '@/lib/database';
import { revalidatePath } from 'next/cache';
import { logAudit } from '@/lib/audit';

export async function createMentor(data: any) {
  try {
    // 1. Insert into mentors table
    const query = `
      INSERT INTO mentors (
        name, email, phone, designation, experience, bio, 
        skills, linkedin, github, website, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      ) RETURNING id
    `;
    const values = [
      data.name,
      data.email,
      data.phone || null,
      data.designation || null,
      data.experience || null,
      data.bio || null,
      data.skills ? data.skills.split(',').map((s: string) => s.trim()) : [],
      data.linkedin || null,
      data.github || null,
      data.website || null,
      data.status || 'active'
    ];

    const res = await pool.query(query, values);
    const mentorId = res.rows[0].id;

    // Log the audit
    // In a real app we'd get the actual admin's UUID from the session
    await logAudit('system-admin', 'CREATE_MENTOR', 'MENTOR_MODULE', mentorId);

    revalidatePath('/admin/mentors');
    return { success: true, id: mentorId };
  } catch (error: any) {
    console.error('Error creating mentor:', error);
    return { success: false, error: error.message };
  }
}
