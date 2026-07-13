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
    const { sendEmail } = await import('../lib/email.js');
    console.log('Sending test email...');
    const result = await sendEmail({
      to: 'dev.emranhossen@gmail.com',
      subject: 'Test Email from Luminous LMS',
      html: '<p>This is a test email from Luminous LMS to confirm SMTP settings work.</p>'
    });
    console.log('Send result:', result);
  } catch (err) {
    console.error('Email Send Error:', err);
  }
}

run();
