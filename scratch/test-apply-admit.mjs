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
    const { query } = await import('../lib/database.js');
    const { sendEmail, getEmailTemplate } = await import('../lib/email.js');
    const bcrypt = (await import('bcryptjs')).default;

    console.log('Testing admission approval flow for application ID 1 (Emran Hossen)...');

    // 1. Fetch current application details
    const appResult = await query(`
      SELECT full_name, email, mobile_no, course, status 
      FROM applications 
      WHERE id = $1
    `, [1]);

    const appData = appResult.rows[0];
    console.log('Current application status:', appData.status);

    const emailLower = appData.email.toLowerCase();
    
    // Check if user already exists
    const userCheck = await query(`SELECT id FROM users WHERE email = $1`, [emailLower]);
    console.log('User check count in users table:', userCheck.rows.length);

    if (userCheck.rows.length === 0) {
      console.log('User does not exist, creating demo password...');
      const demoPassword = Math.random().toString(36).slice(-8) + 'A1!';
      console.log('Generated Demo Password:', demoPassword);
      const passwordHash = await bcrypt.hash(demoPassword, 12);
      console.log('Password hash generated successfully.');

      const roleRes = await query("SELECT id FROM roles WHERE name = 'student'");
      const roleId = roleRes.rows[0]?.id || 5;
      console.log('Student role ID:', roleId);

      const nameParts = appData.full_name.trim().split(' ');
      const firstName = nameParts[0] || 'Student';
      const lastName = nameParts.slice(1).join(' ') || 'User';

      console.log('Inserting user...');
      // Start transaction
      await query('BEGIN');
      const insertUserRes = await query(`
        INSERT INTO users (email, password_hash, first_name, last_name, phone, role_id, is_active, email_verified)
        VALUES ($1, $2, $3, $4, $5, $6, true, true)
        RETURNING id
      `, [emailLower, passwordHash, firstName, lastName, appData.mobile_no || null, roleId]);
      console.log('Inserted user ID:', insertUserRes.rows[0].id);

      // Rollback transaction because this is just a test
      await query('ROLLBACK');
      console.log('Transaction rolled back successfully.');

      // Send email test
      console.log('Testing email template generation...');
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const loginUrl = `${appUrl}/login`;
      
      const welcomeHtml = getEmailTemplate({
        title: 'Admission Approved - Luminous Centre',
        heading: 'Congratulations! Your Admission is Approved',
        bodyHtml: `
          <p>Hello <strong>${appData.full_name}</strong>,</p>
          <p>We are excited to inform you that your application for the course <strong>${appData.course}</strong> has been approved and you have been admitted!</p>
          <p>A student account has been created for you. You can log in using the details below:</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 16px; margin: 25px 0; border: 1px solid #f1f5f9; font-size: 14px;">
            <p style="margin: 0 0 10px 0; color: #475569;"><strong>Login URL:</strong> <a href="${loginUrl}" style="color: #2563eb; text-decoration: none; font-weight: 500;">${loginUrl}</a></p>
            <p style="margin: 0 0 10px 0; color: #475569;"><strong>Username / Email:</strong> ${appData.email}</p>
            <p style="margin: 0; color: #475569;"><strong>Temporary Password:</strong> <code style="background-color: #e2e8f0; padding: 3px 8px; border-radius: 6px; font-family: monospace; font-size: 13px; font-weight: bold; color: #0f172a;">${demoPassword}</code></p>
          </div>
        `
      });

      console.log('Sending welcome email...');
      const emailRes = await sendEmail({
        to: 'dev.emranhossen@gmail.com', // test email address
        subject: 'Your Admission is Approved! - Luminous Centre',
        html: welcomeHtml
      });
      console.log('Email sent result:', emailRes);

    } else {
      console.log('User already exists, checking welcome approval email...');
      // Rollback not needed, user is not created
      const welcomeHtml = getEmailTemplate({
        title: 'Admission Approved - Luminous Centre',
        heading: 'Congratulations! Your Admission is Approved',
        bodyHtml: `
          <p>Hello <strong>${appData.full_name}</strong>,</p>
          <p>We are excited to inform you that your application for the course <strong>${appData.course}</strong> has been approved and you have been admitted!</p>
        `
      });

      console.log('Sending email...');
      const emailRes = await sendEmail({
        to: 'dev.emranhossen@gmail.com', // test email address
        subject: 'Admission Approved! - Luminous Centre',
        html: welcomeHtml
      });
      console.log('Email sent result:', emailRes);
    }
  } catch (err) {
    console.error('Test Flow Error:', err);
  }
}

run();
