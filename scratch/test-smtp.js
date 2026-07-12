const nodemailer = require('nodemailer');

const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
const port = parseInt(process.env.EMAIL_PORT || '587', 10);
const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASSWORD;
const fromEmail = process.env.FROM_EMAIL || `"Luminous Skills" <${user}>`;

console.log('SMTP Config:', { host, port, user, fromEmail });

if (!user || !pass) {
  console.error('SMTP credentials missing!');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: {
    user,
    pass,
  },
});

transporter.sendMail({
  from: fromEmail,
  to: 'luminouscentree@gmail.com', // Send to self
  subject: 'SMTP Test - Luminous Skills',
  html: '<h3>SMTP test successful!</h3><p>Your password reset SMTP flow is configured correctly.</p>',
})
.then(info => {
  console.log('Email sent successfully!', info.messageId);
})
.catch(err => {
  console.error('Failed to send email:', err);
});
