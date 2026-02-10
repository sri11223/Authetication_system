const { Resend } = require('resend');
const transporter = require('../config/email');
const env = require('../config/env');

let resend;
if (env.RESEND_API_KEY) {
  resend = new Resend(env.RESEND_API_KEY);
}


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

  securityAlert: (name, event, ip, device, actionLink) => ({
    subject: `Security Alert: ${event} - Auth System`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🔒 Security Alert</h1>
        </div>
        <div style="background: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px; color: #334155;">Hi <strong>${name}</strong>,</p>
          <p style="font-size: 16px; color: #334155;">We detected a security event on your account:</p>
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
            <p style="font-size: 16px; color: #92400e; font-weight: 600; margin: 0 0 8px 0;">${event}</p>
            ${ip ? `<p style="font-size: 14px; color: #78350f; margin: 4px 0;"><strong>IP Address:</strong> ${ip}</p>` : ''}
            ${device ? `<p style="font-size: 14px; color: #78350f; margin: 4px 0;"><strong>Device:</strong> ${device}</p>` : ''}
            <p style="font-size: 14px; color: #78350f; margin: 8px 0 0 0;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          ${actionLink ? `
          <div style="text-align: center; margin: 32px 0;">
            <a href="${actionLink}" style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600;">
              Secure My Account
            </a>
          </div>
          ` : ''}
          <p style="font-size: 14px; color: #64748b;">If this wasn't you, please secure your account immediately by changing your password.</p>
          <p style="font-size: 14px; color: #64748b;">If this was you, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94a3b8;">This is an automated security notification from Auth System.</p>
        </div>
      </div>
    `,
  }),

  accountLocked: (name, unlockTime) => ({
    subject: 'Account Temporarily Locked - Auth System',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🔒 Account Locked</h1>
        </div>
        <div style="background: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px; color: #334155;">Hi <strong>${name}</strong>,</p>
          <p style="font-size: 16px; color: #334155;">Your account has been temporarily locked due to multiple failed login attempts.</p>
          <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0; border-radius: 4px;">
            <p style="font-size: 14px; color: #991b1b; margin: 0;"><strong>Account will unlock at:</strong> ${unlockTime}</p>
          </div>
          <p style="font-size: 14px; color: #64748b;">This is a security measure to protect your account. If this wasn't you, please contact support immediately.</p>
          <p style="font-size: 14px; color: #64748b;">If you forgot your password, you can reset it using the "Forgot Password" feature.</p>
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
  // Try Resend first (Primary)
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'Auth System <onboarding@resend.dev>',
        to,
        subject: template.subject,
        html: template.html,
      });

      if (error) {
        console.error('[Email] Resend API Error:', error);
        throw new Error(error.message);
      }

      console.log('[Email] Sent via Resend:', data?.id);
      return;
    } catch (error) {
      console.warn('[Email] Resend failed, falling back to SMTP:', error.message);
      // Fall through to SMTP
    }
  }

  // Fallback to SMTP
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

const sendSecurityAlert = async (email, name, event, ip, device, actionLink = null) => {
  const template = EMAIL_TEMPLATES.securityAlert(name, event, ip, device, actionLink);
  await sendEmail(email, template);
};

const sendAccountLockedEmail = async (email, name, unlockTime) => {
  const template = EMAIL_TEMPLATES.accountLocked(name, unlockTime);
  await sendEmail(email, template);
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendSecurityAlert,
  sendAccountLockedEmail,
};
