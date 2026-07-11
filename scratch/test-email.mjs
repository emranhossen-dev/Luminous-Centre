
const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

console.log('Testing Resend with key:', apiKey);
console.log('From Email:', fromEmail);

async function run() {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: ['emranhossen.dev@gmail.com'], // Try sending to a test Gmail address
        subject: 'Test Email from Antigravity',
        html: '<p>This is a test email to verify Resend credentials.</p>',
      }),
    });

    const data = await res.json();
    console.log('Response Status:', res.status);
    console.log('Response Body:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
