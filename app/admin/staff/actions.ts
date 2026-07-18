'use server';

import pool from '@/lib/database';
import { revalidatePath } from 'next/cache';
import { hashPassword } from '@/lib/auth';
import { detectEnrollmentUserColumn } from '@/lib/enrollment';
import { logAudit } from '@/lib/audit';
import { sendEmail, getEmailTemplate } from '@/lib/email';

export interface StaffData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password?: string;
  roleId: number;
  designation?: string;
  permissions: string[];
  isActive?: boolean;
}

// Get all staff users (role != student)
export async function getStaffList() {
  try {
    const query = `
      SELECT 
        u.id,
        u.email,
        u.first_name as "firstName",
        u.last_name as "lastName",
        u.phone,
        u.role_id as "roleId",
        u.is_active as "isActive",
        u.designation,
        u.permissions,
        r.name as "roleName"
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name != 'student'
      ORDER BY u.id DESC
    `;
    const res = await pool.query(query);
    return { success: true, staff: res.rows };
  } catch (error: any) {
    console.error('Failed to fetch staff list:', error);
    return { success: false, error: error.message };
  }
}

// Get all available roles (excluding student)
export async function getRoles() {
  try {
    const query = `
      SELECT id, name, description, permissions
      FROM roles
      WHERE name != 'student'
      ORDER BY id ASC
    `;
    const res = await pool.query(query);
    return { success: true, roles: res.rows };
  } catch (error: any) {
    console.error('Failed to fetch roles:', error);
    return { success: false, error: error.message };
  }
}

// Create a new staff user
export async function createStaff(data: StaffData) {
  try {
    if (!data.password) {
      return { success: false, error: 'Password is required for new staff' };
    }

    const passwordHash = await hashPassword(data.password);
    
    // Check if email already exists
    const checkEmail = await pool.query('SELECT id FROM users WHERE email = $1', [data.email.toLowerCase()]);
    if (checkEmail.rows.length > 0) {
      return { success: false, error: 'Email already registered' };
    }

    const query = `
      INSERT INTO users (
        first_name, last_name, email, password_hash, phone, 
        role_id, designation, permissions, is_active, email_verified
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, true
      ) RETURNING id
    `;
    
    const values = [
      data.firstName,
      data.lastName,
      data.email.toLowerCase(),
      passwordHash,
      data.phone || null,
      data.roleId,
      data.designation || null,
      JSON.stringify(data.permissions || []),
      data.isActive !== undefined ? data.isActive : true
    ];

    const res = await pool.query(query, values);
    const newStaffId = res.rows[0].id;

    // Sync to mentors table if the role is mentor
    try {
      const roleNameRes = await pool.query('SELECT name FROM roles WHERE id = $1', [data.roleId]);
      const roleName = roleNameRes.rows[0]?.name;
      if (roleName === 'mentor') {
        const fullName = `${data.firstName} ${data.lastName}`.trim();
        await pool.query(`
          INSERT INTO mentors (name, email, phone, designation, status)
          VALUES ($1, $2, $3, $4, 'active')
          ON CONFLICT (email) DO UPDATE SET
            name = EXCLUDED.name,
            phone = EXCLUDED.phone,
            designation = EXCLUDED.designation
        `, [fullName, data.email.toLowerCase(), data.phone || null, data.designation || null]);
      }
    } catch (syncError) {
      console.error('Failed to sync staff member to mentors table:', syncError);
    }

    // Send welcome email with login details
    try {
      const loginUrl = `${process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://luminouscentre.org'}/login`;
      const welcomeHtml = getEmailTemplate({
        title: 'Staff Account Created - Luminous Centre',
        heading: 'Welcome to Luminous Centre!',
        bodyHtml: `
          <p>Hello <strong>${data.firstName} ${data.lastName}</strong>,</p>
          <p>Your administrative staff account has been created successfully. You can now log in using the details below:</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 16px; margin: 25px 0; border: 1px solid #f1f5f9; font-size: 14px;">
            <p style="margin: 0 0 10px 0; color: #475569;"><strong>Login URL:</strong> <a href="${loginUrl}" style="color: #2563eb; text-decoration: none; font-weight: 500;">${loginUrl}</a></p>
            <p style="margin: 0 0 10px 0; color: #475569;"><strong>Username / Email:</strong> ${data.email}</p>
            <p style="margin: 0; color: #475569;"><strong>Temporary Password:</strong> <code style="background-color: #e2e8f0; padding: 3px 8px; border-radius: 6px; font-family: monospace; font-size: 13px; font-weight: bold; color: #0f172a;">${data.password}</code></p>
          </div>
          
          <p style="font-size: 13px; color: #e11d48; font-weight: 500; margin-top: 20px;">
            * Important: Please log in and update your password immediately inside your profile settings for safety.
          </p>
        `,
        ctaText: 'Log In to Dashboard',
        ctaLink: loginUrl
      });

      await sendEmail({
        to: data.email,
        subject: 'Your Staff Account is Ready! - Luminous Centre',
        html: welcomeHtml
      });
    } catch (mailError) {
      console.error('Failed to send welcome email to staff:', mailError);
    }

    // Log audit trail
    await logAudit(
      '0', // system/admin id placeholder
      'CREATE_STAFF_USER',
      'STAFF_MODULE',
      newStaffId.toString()
    );

    revalidatePath('/admin/staff');
    return { success: true, id: newStaffId };
  } catch (error: any) {
    console.error('Error in createStaff server action:', error);
    return { success: false, error: error.message };
  }
}

// Update an existing staff user
export async function updateStaff(id: number, data: StaffData) {
  try {
    // Check if email is already in use by another user
    const checkEmail = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [data.email.toLowerCase(), id]);
    if (checkEmail.rows.length > 0) {
      return { success: false, error: 'Email already in use by another account' };
    }

    let queryStr = `
      UPDATE users 
      SET 
        first_name = $1, 
        last_name = $2, 
        email = $3, 
        phone = $4, 
        role_id = $5, 
        designation = $6, 
        permissions = $7,
        is_active = $8,
        updated_at = CURRENT_TIMESTAMP
    `;
    
    const values = [
      data.firstName,
      data.lastName,
      data.email.toLowerCase(),
      data.phone || null,
      data.roleId,
      data.designation || null,
      JSON.stringify(data.permissions || []),
      data.isActive !== undefined ? data.isActive : true
    ];

    let paramCounter = 9;

    // Only update password if provided
    if (data.password && data.password.trim() !== '') {
      const passwordHash = await hashPassword(data.password);
      queryStr += `, password_hash = $${paramCounter}`;
      values.push(passwordHash);
      paramCounter++;
    }

    queryStr += ` WHERE id = $${paramCounter}`;
    values.push(id);
    await pool.query(queryStr, values);

    // Sync to mentors table if the role is mentor, or delete from mentors if changed from mentor
    try {
      const roleNameRes = await pool.query('SELECT name FROM roles WHERE id = $1', [data.roleId]);
      const roleName = roleNameRes.rows[0]?.name;
      if (roleName === 'mentor') {
        const fullName = `${data.firstName} ${data.lastName}`.trim();
        await pool.query(`
          INSERT INTO mentors (name, email, phone, designation, status)
          VALUES ($1, $2, $3, $4, 'active')
          ON CONFLICT (email) DO UPDATE SET
            name = EXCLUDED.name,
            phone = EXCLUDED.phone,
            designation = EXCLUDED.designation
        `, [fullName, data.email.toLowerCase(), data.phone || null, data.designation || null]);
      } else {
        // If changed to another role, delete from mentors to keep synced
        await pool.query('DELETE FROM mentors WHERE email = $1', [data.email.toLowerCase()]);
      }
    } catch (syncError) {
      console.error('Failed to sync updated staff member to mentors table:', syncError);
    }

    // Log audit trail
    await logAudit(
      '0',
      'UPDATE_STAFF_USER',
      'STAFF_MODULE',
      id.toString()
    );

    revalidatePath('/admin/staff');
    return { success: true };
  } catch (error: any) {
    console.error('Error in updateStaff server action:', error);
    return { success: false, error: error.message };
  }
}

// Toggle staff active status
export async function toggleStaffStatus(id: number, currentStatus: boolean) {
  try {
    const query = `
      UPDATE users 
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;
    await pool.query(query, [!currentStatus, id]);

    await logAudit(
      '0',
      currentStatus ? 'DEACTIVATE_STAFF' : 'ACTIVATE_STAFF',
      'STAFF_MODULE',
      id.toString()
    );

    revalidatePath('/admin/staff');
    return { success: true };
  } catch (error: any) {
    console.error('Error in toggleStaffStatus:', error);
    return { success: false, error: error.message };
  }
}

// Delete staff user
export async function deleteStaff(id: number) {
  try {
    // Get user details
    const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [id]);
    if (userRes.rows.length > 0) {
      const email = userRes.rows[0].email;
      
      // Nullify references in courses table pointing to this mentor
      const mentorRes = await pool.query('SELECT id FROM mentors WHERE email = $1', [email]);
      if (mentorRes.rows.length > 0) {
        const mentorId = mentorRes.rows[0].id;
        await pool.query('UPDATE courses SET mentor_id = NULL WHERE mentor_id = $1', [mentorId]);
      }
      
      // Delete from mentors table
      await pool.query('DELETE FROM mentors WHERE email = $1', [email]);
      // Delete from students table if they are registered as student
      await pool.query('DELETE FROM students WHERE email = $1', [email.toLowerCase()]);
    }
    
    // Detect correct student/user column in enrollments
    const userColumn = await detectEnrollmentUserColumn();

    // Delete activity logs for the user to bypass the FK constraint
    await pool.query('DELETE FROM activity_logs WHERE user_id = $1', [id]);
    // Nullify course creation references
    await pool.query('UPDATE courses SET created_by = NULL WHERE created_by = $1', [id]);
    // Delete enrollments and enrollment requests
    await pool.query(`DELETE FROM enrollments WHERE ${userColumn} = $1`, [id]);
    await pool.query('DELETE FROM course_enrollment_requests WHERE user_id = $1', [id]);
    
    // Delete from users table
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    await logAudit('0', 'DELETE_STAFF_USER', 'STAFF_MODULE', id.toString());
    revalidatePath('/admin/staff');
    return { success: true };
  } catch (error: any) {
    console.error('Error in deleteStaff:', error);
    return { success: false, error: 'Could not delete staff: ' + error.message };
  }
}
