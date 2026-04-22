import { Resend } from 'resend';
import { env } from '../infrastructure/env';
import { logger } from '../infrastructure/logger';

const resend = new Resend(env.RESEND_API_KEY || '');

interface EmailData {
  to: string;
  subject: string;
  html: string;
}

export const emailService = {
  async sendEmail(data: EmailData): Promise<boolean> {
    try {
      // If no API key, log to console (development mode)
      if (!env.RESEND_API_KEY) {
        logger.info(`[EMAIL - DEV MODE] To: ${data.to}\nSubject: ${data.subject}\n${data.html}`);
        return true;
      }

      const result = await resend.emails.send({
        from: env.EMAIL_FROM || 'noreply@sevasync.app',
        to: data.to,
        subject: data.subject,
        html: data.html,
      });

      if (result.error) {
        logger.error({ error: result.error }, `Failed to send email to ${data.to}`);
        return false;
      }

      logger.info(`Email sent successfully to ${data.to} (ID: ${result.data?.id})`);
      return true;
    } catch (error) {
      logger.error({ error }, `Error sending email to ${data.to}`);
      return false;
    }
  },

  async sendPasswordResetEmail(email: string, resetLink: string): Promise<boolean> {
    const html = `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset for your SevaSync account.</p>
      <p><a href="${resetLink}">Click here to reset your password</a></p>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    return this.sendEmail({
      to: email,
      subject: 'SevaSync - Password Reset',
      html,
    });
  },

  async sendOTPEmail(email: string, code: string, type: string): Promise<boolean> {
    let subject = 'SevaSync - Email Verification';
    let title = 'Email Verification Code';

    if (type === 'password_reset') {
      subject = 'SevaSync - Password Reset OTP';
      title = 'Password Reset Code';
    }

    const html = `
      <h2>${title}</h2>
      <p>Your verification code is:</p>
      <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${code}</p>
      <p>This code expires in 10 minutes.</p>
      <p>If you didn't request this code, please ignore this email.</p>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
    });
  },

  async sendInviteEmail(email: string, inviterName: string, role: string, signupLink: string): Promise<boolean> {
    const html = `
      <h2>You're Invited to Join SevaSync</h2>
      <p><strong>${inviterName}</strong> has invited you to join SevaSync as a <strong>${role}</strong>.</p>
      <p>
        <a href="${signupLink}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">
          Accept Invitation
        </a>
      </p>
      <p>This invitation link expires in 7 days.</p>
    `;

    return this.sendEmail({
      to: email,
      subject: 'SevaSync - You\'re Invited!',
      html,
    });
  },

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const html = `
      <h2>Welcome to SevaSync!</h2>
      <p>Hi ${name},</p>
      <p>Your account has been successfully created. You can now log in to SevaSync and start collaborating.</p>
      <p><a href="${env.APP_URL || 'https://sevasync.app'}/login">Login to SevaSync</a></p>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to SevaSync',
      html,
    });
  },

  async sendActivityAlertEmail(email: string, activityDetails: string): Promise<boolean> {
    const html = `
      <h2>Security Alert</h2>
      <p>We detected a new login to your SevaSync account:</p>
      <p>${activityDetails}</p>
      <p>If this wasn't you, please change your password immediately.</p>
    `;

    return this.sendEmail({
      to: email,
      subject: 'SevaSync - Security Alert',
      html,
    });
  },

  async sendNotificationEmail(email: string, notificationTitle: string, notificationMessage: string): Promise<boolean> {
    const html = `
      <h2>${notificationTitle}</h2>
      <p>${notificationMessage}</p>
      <p><a href="${env.APP_URL || 'https://sevasync.app'}/notifications">View in SevaSync</a></p>
    `;

    return this.sendEmail({
      to: email,
      subject: `SevaSync - ${notificationTitle}`,
      html,
    });
  },
};

export default emailService;
