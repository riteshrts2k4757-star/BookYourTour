const nodemailer = require('nodemailer');
const { htmlToText } = require('html-to-text');

const escapeHtml = value => String(value || '').replace(/[&<>"']/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[character]));

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Sarthi Travel <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME || 'apikey',
          pass: process.env.SENDGRID_API_KEY || process.env.SENDGRID_PASSWORD
        }
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async send(subject, message, actionLabel) {
    const url = escapeHtml(this.url);
    const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#14213d;line-height:1.6"><h1>${escapeHtml(subject)}</h1><p>Hello ${escapeHtml(this.firstName)},</p><p>${escapeHtml(message)}</p><p><a href="${url}" style="display:inline-block;background:#0f766e;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none">${escapeHtml(actionLabel)}</a></p><p>If you did not request this, you can ignore this message.</p></body></html>`;
    await this.newTransport().sendMail({
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html)
    });
  }

  async sendWelcome() {
    await this.send(
      'Welcome to Sarthi Travel',
      'Your traveller account is ready. Explore tours and manage your bookings from your account.',
      'Open your account'
    );
  }

  async sendPasswordReset() {
    await this.send(
      'Reset your Sarthi password',
      'A password reset was requested for your account. This link expires in 10 minutes and can only be used once.',
      'Reset password'
    );
  }
};
