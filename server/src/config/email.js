const nodemailer = require('nodemailer');
const env = require('./env');

const createTransporter = () => {
  if (env.isDevelopment() && (!env.SMTP_USER || !env.SMTP_PASS)) {
    console.warn('[Email] SMTP credentials not configured. Emails will be logged to console.');
    return null;
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
};

const transporter = createTransporter();

module.exports = transporter;
