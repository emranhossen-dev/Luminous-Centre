'use server';

import pool from '@/lib/database';
import { revalidatePath } from 'next/cache';
import { detectEnrollmentUserColumn } from '@/lib/enrollment';
import { logAudit } from '@/lib/audit';

export async function deleteStudent(userId: number) {
  try {
    const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) {
      return { success: false, error: 'Student user not found' };
    }
    const email = userRes.rows[0].email.toLowerCase();

    // Detect user column in enrollments
    const userColumn = await detectEnrollmentUserColumn();

    // Delete in sequence to avoid foreign key violations
    await pool.query('DELETE FROM activity_logs WHERE user_id = $1', [userId]);
    await pool.query(`DELETE FROM enrollments WHERE ${userColumn} = $1`, [userId]);
    await pool.query('DELETE FROM course_enrollment_requests WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM students WHERE email = $1', [email]);
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    try {
      await logAudit('0', 'DELETE_STUDENT_USER', 'STUDENTS_MODULE', userId.toString());
    } catch (auditError) {
      console.warn('Failed to write audit log for deleteStudent:', auditError);
    }

    revalidatePath('/admin/students');
    revalidatePath('/admin/enrollments');

    return { success: true };
  } catch (error: any) {
    console.error('Error in deleteStudent server action:', error);
    return { success: false, error: error.message || 'Failed to delete student' };
  }
}

interface UpdateStudentData {
  name: string;
  email: string;
  phone: string | null;
  status: string;
  department: string | null;
  designation: string | null;
  mentorId: string | null;
}

export async function updateStudent(userId: number, data: UpdateStudentData) {
  try {
    // 1. Get old email
    const oldUserRes = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
    if (oldUserRes.rows.length === 0) {
      return { success: false, error: 'Student user not found' };
    }
    const oldEmail = oldUserRes.rows[0].email.toLowerCase();

    // 2. Parse name
    const nameParts = data.name.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Student';
    const lastName = nameParts.slice(1).join(' ') || 'User';

    // 3. Update users table
    const isActive = data.status === 'active';
    await pool.query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, email = $3, phone = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6`,
      [firstName, lastName, data.email.toLowerCase(), data.phone, isActive, userId]
    );

    // 4. Update students table
    await pool.query(
      `UPDATE students 
       SET name = $1, email = $2, phone = $3, status = $4, department = $5, designation = $6, mentor_id = $7, updated_at = CURRENT_TIMESTAMP
       WHERE LOWER(email) = $8`,
      [
        data.name.trim(),
        data.email.toLowerCase(),
        data.phone,
        data.status,
        data.department,
        data.designation,
        data.mentorId || null,
        oldEmail
      ]
    );

    revalidatePath('/admin/students');
    
    // Attempt to fetch student UUID to revalidate their specific detail page
    const studentUuidRes = await pool.query('SELECT id FROM students WHERE LOWER(email) = $1', [data.email.toLowerCase()]);
    if (studentUuidRes.rows.length > 0) {
      revalidatePath(`/admin/students/${studentUuidRes.rows[0].id}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in updateStudent server action:', error);
    return { success: false, error: error.message || 'Failed to update student' };
  }
}

export async function assignMentor(studentIdUuid: string, mentorIdUuid: string | null) {
  try {
    await pool.query(
      'UPDATE students SET mentor_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [mentorIdUuid || null, studentIdUuid]
    );

    revalidatePath('/admin/students');
    revalidatePath(`/admin/students/${studentIdUuid}`);

    return { success: true };
  } catch (error: any) {
    console.error('Error in assignMentor server action:', error);
    return { success: false, error: error.message || 'Failed to assign mentor' };
  }
}
