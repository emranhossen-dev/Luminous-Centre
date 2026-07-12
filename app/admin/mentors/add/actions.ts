'use server';

import pool from '@/lib/database';
import { revalidatePath } from 'next/cache';
import { logAudit } from '@/lib/audit';
import { hashPassword } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

export async function createMentor(data: any) {
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if email already registered in users table
      const checkEmail = await client.query('SELECT id FROM users WHERE email = $1', [data.email.toLowerCase()]);
      if (checkEmail.rows.length > 0) {
        return { success: false, error: 'Email already registered' };
      }

      // Fetch the 'mentor' role ID
      const roleRes = await client.query("SELECT id FROM roles WHERE name = 'mentor'");
      if (roleRes.rows.length === 0) {
        return { success: false, error: "Role 'mentor' is not configured in the database" };
      }
      const roleId = roleRes.rows[0].id;

      // Hash the password
      const passwordHash = await hashPassword(data.password);

      // Split Full Name into First and Last names
      const nameParts = data.name.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Insert into users table
      const insertUserQuery = `
        INSERT INTO users (
          first_name, last_name, email, password_hash, phone, 
          role_id, designation, is_active, email_verified, permissions
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, true, $9
        ) RETURNING id
      `;
      const userValues = [
        firstName,
        lastName,
        data.email.toLowerCase(),
        passwordHash,
        data.phone || null,
        roleId,
        data.designation || null,
        data.status === 'active',
        JSON.stringify(['mentor_portal']) // standard default mentor permission
      ];
      await client.query(insertUserQuery, userValues);

      // Insert into mentors table
      const query = `
        INSERT INTO mentors (
          name, email, phone, designation, experience, bio, 
          skills, linkedin, github, website, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        ) ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          phone = EXCLUDED.phone,
          designation = EXCLUDED.designation,
          experience = EXCLUDED.experience,
          bio = EXCLUDED.bio,
          skills = EXCLUDED.skills,
          linkedin = EXCLUDED.linkedin,
          github = EXCLUDED.github,
          website = EXCLUDED.website,
          status = EXCLUDED.status
        RETURNING id
      `;
      const values = [
        data.name,
        data.email.toLowerCase(),
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

      const res = await client.query(query, values);
      const mentorId = res.rows[0].id;

      await client.query('COMMIT');

      // Send email invitation to newly created mentor
      const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`;
      
      const inviteHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); color: #1e293b;">
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="display: inline-block; background-color: #2563eb; color: white; padding: 12px; border-radius: 12px; font-weight: bold; font-size: 20px; letter-spacing: 0.5px;">Luminous Skill Development Training Center</div>
          </div>
          <h2 style="color: #0f172a; font-size: 20px; font-weight: bold; margin-bottom: 15px;">Welcome to the Mentor Team!</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">Hello <strong>${data.name}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">You have been registered as a Mentor at the <strong>Luminous Skill Development Training Center</strong>!</p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">An account has been provisioned for you. You can log in to access the mentor portal, manage courses, view student submissions, and perform grading using the credentials below:</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 16px; margin: 25px 0; border: 1px solid #f1f5f9; font-size: 14px;">
            <p style="margin: 0 0 10px 0; color: #475569;"><strong>Login URL:</strong> <a href="${loginUrl}" style="color: #2563eb; text-decoration: none; font-weight: 500;">${loginUrl}</a></p>
            <p style="margin: 0 0 10px 0; color: #475569;"><strong>Username / Email:</strong> ${data.email.toLowerCase()}</p>
            <p style="margin: 0; color: #475569;"><strong>Temporary Password:</strong> <code style="background-color: #e2e8f0; padding: 3px 8px; border-radius: 6px; font-family: monospace; font-size: 13px; font-weight: bold; color: #0f172a;">${data.password}</code></p>
          </div>
          
          <p style="font-size: 13px; color: #e11d48; font-weight: 500; margin-top: 20px;">
            * Important: Please reset your temporary password immediately upon your first login for security reasons.
          </p>
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 25px 0;" />
          <p style="font-size: 11px; text-align: center; color: #94a3b8; margin: 0;">
            Luminous Skill Development Training Center.
          </p>
        </div>
      `;

      sendEmail({
        to: data.email.toLowerCase(),
        subject: 'Mentor Invitation - Luminous Skill Development Training Center',
        html: inviteHtml
      }).catch(err => console.error('[MENTOR-INVITATION-EMAIL] Error sending invitation email:', err));

      // Log the audit
      await logAudit('system-admin', 'CREATE_MENTOR', 'MENTOR_MODULE', mentorId);

      revalidatePath('/admin/mentors');
      return { success: true, id: mentorId };
    } catch (innerError) {
      await client.query('ROLLBACK');
      throw innerError;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error creating mentor:', error);
    return { success: false, error: error.message };
  }
}

export async function updateMentor(id: number, data: any) {
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get old email
      const oldRes = await client.query('SELECT email FROM mentors WHERE id = $1', [id]);
      if (oldRes.rows.length === 0) {
        return { success: false, error: 'Mentor not found' };
      }
      const oldEmail = oldRes.rows[0].email;

      // If email is changing, verify new email is unique
      if (oldEmail.toLowerCase() !== data.email.toLowerCase()) {
        const checkEmail = await client.query('SELECT id FROM users WHERE email = $1', [data.email.toLowerCase()]);
        if (checkEmail.rows.length > 0) {
          return { success: false, error: 'New email is already in use' };
        }
      }

      // Hash password if updating
      let passwordHash = null;
      if (data.password && data.password.trim() !== '') {
        passwordHash = await hashPassword(data.password);
      }

      // Split full name
      const nameParts = data.name.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Update users table
      let updateUserQuery = `
        UPDATE users 
        SET 
          first_name = $1, 
          last_name = $2, 
          email = $3, 
          phone = $4, 
          designation = $5,
          is_active = $6,
          updated_at = CURRENT_TIMESTAMP
      `;
      const userValues = [
        firstName,
        lastName,
        data.email.toLowerCase(),
        data.phone || null,
        data.designation || null,
        data.status === 'active'
      ];

      let paramCounter = 7;
      if (passwordHash) {
        updateUserQuery += `, password_hash = $${paramCounter}`;
        userValues.push(passwordHash);
        paramCounter++;
      }

      updateUserQuery += ` WHERE email = $${paramCounter}`;
      userValues.push(oldEmail.toLowerCase());

      await client.query(updateUserQuery, userValues);

      // Update mentors table
      const query = `
        UPDATE mentors 
        SET 
          name = $1, 
          email = $2, 
          phone = $3, 
          designation = $4, 
          experience = $5, 
          bio = $6, 
          skills = $7, 
          linkedin = $8, 
          github = $9, 
          website = $10, 
          status = $11,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $12
      `;
      const values = [
        data.name,
        data.email.toLowerCase(),
        data.phone || null,
        data.designation || null,
        data.experience || null,
        data.bio || null,
        data.skills ? (Array.isArray(data.skills) ? data.skills : data.skills.split(',').map((s: string) => s.trim())) : [],
        data.linkedin || null,
        data.github || null,
        data.website || null,
        data.status || 'active',
        id
      ];

      await client.query(query, values);
      await client.query('COMMIT');

      // Log audit
      await logAudit('system-admin', 'UPDATE_MENTOR', 'MENTOR_MODULE', id.toString());

      revalidatePath('/admin/mentors');
      return { success: true };
    } catch (innerError) {
      await client.query('ROLLBACK');
      throw innerError;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error updating mentor:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteMentor(id: number) {
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get mentor email
      const res = await client.query('SELECT email FROM mentors WHERE id = $1', [id]);
      if (res.rows.length > 0) {
        const email = res.rows[0].email;
        
        // Nullify course references
        await client.query('UPDATE courses SET mentor_id = NULL WHERE mentor_id = $1', [id]);

        // Delete from users table
        await client.query('DELETE FROM users WHERE email = $1', [email.toLowerCase()]);
      }

      // Delete from mentors table
      await client.query('DELETE FROM mentors WHERE id = $1', [id]);

      await client.query('COMMIT');

      // Log audit
      await logAudit('system-admin', 'DELETE_MENTOR', 'MENTOR_MODULE', id.toString());

      revalidatePath('/admin/mentors');
      return { success: true };
    } catch (innerError) {
      await client.query('ROLLBACK');
      throw innerError;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error deleting mentor:', error);
    return { success: false, error: error.message };
  }
}

