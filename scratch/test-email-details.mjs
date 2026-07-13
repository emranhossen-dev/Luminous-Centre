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
    console.log('Running detailResult query...');
    const enrollmentRequest = { user_id: 1, course_id: 39 }; // sample user ID 1 and course ID 39
    const result = await query(
      `SELECT u.email, u.first_name as "firstName", u.last_name as "lastName", c.title as "courseTitle"
       FROM users u, courses c
       WHERE u.id = $1 AND c.id = $2`,
      [enrollmentRequest.user_id, enrollmentRequest.course_id]
    );
    console.log('Result rows:', result.rows);
  } catch (err) {
    console.error('Query Error:', err);
  }
}

run();
