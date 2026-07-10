export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an email using the Resend API via a direct fetch HTTP POST request.
 * Does not require installing third-party npm packages.
 */
export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || 'Luminous Skills <onboarding@resend.dev>';

  console.log(`[EMAIL-SENDER] Attempting to send email to: ${to}, Subject: "${subject}"`);

  if (!apiKey) {
    console.warn('================================================================');
    console.warn('WARNING: RESEND_API_KEY is not configured in .env file.');
    console.warn(`An email WOULD have been sent from: ${fromEmail}`);
    console.warn(`To: ${to}`);
    console.warn(`Subject: ${subject}`);
    console.warn('Content:');
    console.warn(html.replace(/<[^>]*>/g, ' ')); // Strip HTML tags for console visibility
    console.warn('================================================================');
    
    // Return success true in development to allow flows to complete without crashing
    return { 
      success: true, 
      warning: 'RESEND_API_KEY not configured, logged to console.',
      loggedToConsole: true 
    };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      console.log(`[EMAIL-SENDER] Email sent successfully via Resend. ID: ${data.id}`);
      return { success: true, data };
    } else {
      console.error('[EMAIL-SENDER] Resend API error response:', data);
      return { success: false, error: data.message || 'Resend API returned an error' };
    }
  } catch (error: any) {
    console.error('[EMAIL-SENDER] Network error sending email:', error);
    return { success: false, error: error.message || 'Network error occurred' };
  }
}
