import fs from 'fs';

// Parse .env first
try {
  const envText = fs.readFileSync('.env', 'utf8');
  for (const line of envText.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const firstEq = trimmed.indexOf('=');
    if (firstEq === -1) continue;
    const key = trimmed.substring(0, firstEq).trim();
    const val = trimmed.substring(firstEq + 1).trim();
    process.env[key] = val;
  }
} catch (e) {}

async function run() {
  try {
    const { PATCH } = await import('../app/api/admin/enhanced-enrollments/[id]/route.ts');
    
    // We create a mock Request object
    const mockRequest = {
      headers: {
        get: (name) => {
          if (name === 'authorization') {
            // Let's get the admin token from DB to make a valid token, or just mock it by bypass token verify
            return 'Bearer mock-token';
          }
          return null;
        }
      },
      json: async () => ({ enrollment_status: 'admitted' })
    };

    console.log('Invoking PATCH handler...');
    // Wait, let's just simulate the exact logic directly in JavaScript to see where it crashes!
    // That avoids NextRequest/NextResponse mock complexity.
    
    const { query } = await import('../lib/database.js');
    const bcrypt = (await import('bcryptjs')).default;
    const { sendEmail, getEmailTemplate } = await import('../lib/email.js');

    const enrollmentId = 33; // let's try updating request 33 (which has user_id: null, email: emran40989@gmail.com)
    const body = { enrollment_status: 'admitted' };
    
    console.log('Simulating PATCH handler internal code steps...');

    // 1. Build update query
    const updateFields = ['enrollment_status = $1', 'reviewed_by = $2', 'reviewed_at = $3'];
    const updateValues = ['admitted', 1, new Date(), enrollmentId]; // mock admin ID = 1
    
    const updateQuery = `
      UPDATE course_enrollment_requests 
      SET ${updateFields.join(', ')}
      WHERE id = $4
      RETURNING *
    `;
    
    console.log('Executing UPDATE query...');
    const result = await query(updateQuery, updateValues);
    const enrollmentRequest = result.rows[0];
    console.log('Updated enrollmentRequest:', enrollmentRequest);

    let userId = enrollmentRequest.user_id;
    let generatedPassword = '';
    let isNewUserCreated = false;

    const emailLower = (body.email || enrollmentRequest.email || '').trim().toLowerCase();
    console.log('emailLower:', emailLower);

    if (!userId && emailLower) {
      console.log('User is guest, checking if exists...');
      const userCheck = await query('SELECT id FROM users WHERE email = $1', [emailLower]);
      console.log('User check length:', userCheck.rows.length);
      
      if (userCheck.rows.length > 0) {
        userId = userCheck.rows[0].id;
        await query(
          'UPDATE course_enrollment_requests SET user_id = $1 WHERE id = $2',
          [userId, enrollmentId]
        );
        enrollmentRequest.user_id = userId;
      } else if (enrollmentRequest.enrollment_status === 'admitted' || enrollmentRequest.enrollment_status === 'approved') {
        console.log('Creating new user...');
        generatedPassword = Math.random().toString(36).slice(-8) + 'A1!';
        const passwordHash = await bcrypt.hash(generatedPassword, 12);

        const roleRes = await query("SELECT id FROM roles WHERE name = 'student'");
        const roleId = roleRes.rows[0]?.id || 5;
        console.log('roleId:', roleId);

        const nameParts = (body.full_name || enrollmentRequest.full_name || 'Student').trim().split(' ');
        const firstName = nameParts[0] || 'Student';
        const lastName = nameParts.slice(1).join(' ') || 'User';
        const phone = body.mobile_number || enrollmentRequest.mobile_number || null;

        const newUserRes = await query(
          `INSERT INTO users (email, password_hash, first_name, last_name, phone, role_id, is_active, email_verified)
           VALUES ($1, $2, $3, $4, $5, $6, true, true)
           RETURNING id`,
          [emailLower, passwordHash, firstName, lastName, phone, roleId]
        );
        
        userId = newUserRes.rows[0].id;
        console.log('Created user ID:', userId);
        
        await query(
          'UPDATE course_enrollment_requests SET user_id = $1 WHERE id = $2',
          [userId, enrollmentId]
        );
        enrollmentRequest.user_id = userId;
        isNewUserCreated = true;
      }
    }

    if (userId && (enrollmentRequest.enrollment_status === 'admitted' || enrollmentRequest.enrollment_status === 'approved')) {
      console.log('Adding active enrollment...');
      const { createEnrollmentIfMissing } = await import('../lib/enrollment.js');
      await createEnrollmentIfMissing(userId, enrollmentRequest.course_id);
      console.log('Active enrollment added.');
    }

  } catch (err) {
    console.error('CRASH DETECTED:', err);
  }
}

run();
