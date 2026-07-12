import nodemailer from 'nodemailer';

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an email using SMTP transport via nodemailer.
 */
export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || '587', 10);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;
  const fromEmail = process.env.FROM_EMAIL || `"Luminous Skills" <${user}>`;

  console.log(`[EMAIL-SENDER] Attempting to send email to: ${to}, Subject: "${subject}"`);

  if (!user || !pass) {
    console.warn('================================================================');
    console.warn('WARNING: EMAIL_USER or EMAIL_PASSWORD is not configured in .env file.');
    console.warn(`An email WOULD have been sent from: ${fromEmail}`);
    console.warn(`To: ${to}`);
    console.warn(`Subject: ${subject}`);
    console.warn('Content:');
    console.warn(html.replace(/<[^>]*>/g, ' ')); // Strip HTML tags for console visibility
    console.warn('================================================================');
    
    // Return success true in development to allow flows to complete without crashing
    return { 
      success: true, 
      warning: 'EMAIL_USER or EMAIL_PASSWORD not configured, logged to console.',
      loggedToConsole: true 
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for port 465 (SSL), false for port 587 (TLS/STARTTLS)
      auth: {
        user,
        pass,
      },
    });

    const info = await transporter.sendMail({
      from: fromEmail,
      to,
      subject,
      html,
    });

    console.log(`[EMAIL-SENDER] Email sent successfully via SMTP. Message ID: ${info.messageId}`);
    return { success: true, data: info };
  } catch (error: any) {
    console.error('[EMAIL-SENDER] Error sending email via SMTP:', error);
    return { success: false, error: error.message || 'Error occurred during SMTP transfer' };
  }
}

