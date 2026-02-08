const transporter = require('../config/email');
const env = require('../config/env');

const EMAIL_TEMPLATES = {
  verification: (name, link) => ({
    subject: 'Verify Your Email - Auth System',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Email Verification</h1>
        </div>
        <div style="background: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px; color: #334155;">Hi <strong>${name}</strong>,</p>
          <p style="font-size: 16px; color: #334155;">Thank you for creating an account. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${link}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600;">
              Verify Email Address
            </a>
          </div>
          <p style="font-size: 14px; color: #64748b;">This link will expire in 24 hours.</p>
          <p style="font-size: 14px; color: #64748b;">If you didn't create an account, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94a3b8;">If the button doesn't work, copy and paste this link into your browser:<br /><a href="${link}" style="color: #667eea;">${link}</a></p>
        </div>
      </div>
    `,
  }),

  passwordReset: (name, link) => ({
    subject: 'Reset Your Password - Auth System',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Password Reset</h1>
        </div>
        <div style="background: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px; color: #334155;">Hi <strong>${name}</strong>,</p>
          <p style="font-size: 16px; color: #334155;">We received a request to reset your password. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${link}" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 14px; color: #64748b;">This link will expire in 1 hour and can only be used once.</p>
          <p style="font-size: 14px; color: #64748b;">If you didn't request this, your account is safe — just ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94a3b8;">If the button doesn't work, copy and paste this link:<br /><a href="${link}" style="color: #f5576c;">${link}</a></p>
        </div>
      </div>
    `,
  }),
};

/**
 * Sends an email using the configured transporter.
 * Falls back to console logging in development when SMTP isn't configured.
 */
const sendEmail = async (to, template) => {
  if (!transporter) {
    console.log(`\n[Email Dev Mode] To: ${to}`);
    console.log(`Subject: ${template.subject}`);
    console.log(`(Email HTML content logged — configure SMTP for actual delivery)\n`);
    return;
  }

  const mailOptions = {
    from: `"Auth System" <${env.SMTP_USER}>`,
    to,
    subject: template.subject,
    html: template.html,
  };

  await transporter.sendMail(mailOptions);
};

const sendVerificationEmail = async (email, name, token) => {
  const verificationLink = `${env.CLIENT_URL}/verify-email?token=${token}`;
  const template = EMAIL_TEMPLATES.verification(name, verificationLink);
  await sendEmail(email, template);
};

const sendPasswordResetEmail = async (email, name, token) => {
  const resetLink = `${env.CLIENT_URL}/reset-password?token=${token}`;
  const template = EMAIL_TEMPLATES.passwordReset(name, resetLink);
  await sendEmail(email, template);
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
