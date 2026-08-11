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
  const fromEmail = process.env.FROM_EMAIL || `"Luminous Centre" <${user}>`;

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

export interface EmailTemplateParams {
  title: string;
  heading: string;
  bodyHtml: string;
  ctaText?: string;
  ctaLink?: string;
}

export function getEmailTemplate({ title, heading, bodyHtml, ctaText, ctaLink }: EmailTemplateParams): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.luminouscentre.org';
  const logoUrl = appUrl.includes('localhost')
    ? 'https://raw.githubusercontent.com/emranhossen-dev/Luminous-Centre/main/public/logo.jpg'
    : `${appUrl}/logo.jpg`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 40px 20px;
      box-sizing: border-box;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 24px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.02), 0 8px 10px -6px rgba(0, 0, 0, 0.02);
      overflow: hidden;
    }
    .header {
      padding: 32px 40px 20px;
      text-align: center;
    }
    .logo-img {
      height: 60px;
      width: auto;
      display: inline-block;
      vertical-align: middle;
    }
    .brand-name {
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.5px;
      margin-top: 12px;
    }
    .divider {
      height: 1px;
      background: linear-gradient(90deg, rgba(226,232,240,0) 0%, rgba(226,232,240,1) 50%, rgba(226,232,240,0) 100%);
      margin: 0 40px;
    }
    .content {
      padding: 40px;
    }
    .heading {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.3;
      margin-top: 0;
      margin-bottom: 20px;
      letter-spacing: -0.5px;
    }
    .body-text {
      font-size: 15px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 30px;
    }
    .cta-container {
      text-align: center;
      margin: 35px 0;
    }
    .cta-button {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff !important;
      padding: 14px 32px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 15px;
      text-decoration: none;
      display: inline-block;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
    }
    .footer {
      padding: 32px 40px;
      background-color: #f8fafc;
      border-top: 1px solid #f1f5f9;
      text-align: center;
    }
    .footer-text {
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.5;
      margin: 0;
    }
    .footer-links {
      margin-top: 16px;
    }
    .footer-link {
      font-size: 12px;
      color: #64748b;
      text-decoration: none;
      margin: 0 8px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img src="${logoUrl}" alt="Luminous Centre Logo" class="logo-img">
        <div class="brand-name">Luminous Centre</div>
      </div>
      <div class="divider"></div>
      <div class="content">
        <h1 class="heading">${heading}</h1>
        <div class="body-text">
          ${bodyHtml}
        </div>
        ${ctaText && ctaLink ? `
          <div class="cta-container">
            <a href="${ctaLink}" class="cta-button">${ctaText}</a>
          </div>
        ` : ''}
      </div>
      <div class="footer">
        <p class="footer-text">
          Luminous Centre Skill Development Training Center<br>
          Shaping the future through professional skills development training.
        </p>
        <div class="footer-links">
          <a href="${appUrl}" class="footer-link">Website</a>
          <span style="color: #cbd5e1;">&bull;</span>
          <a href="${appUrl}/login" class="footer-link">Student Portal</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

