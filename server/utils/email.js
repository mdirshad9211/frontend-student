const nodemailer = require('nodemailer');
const { env } = require('../config/env');

let cachedTransporter = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;
  if (!env.EMAIL_USER || !env.EMAIL_PASS) return null;

  cachedTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  });

  return cachedTransporter;
}

async function sendEmail({ to, subject, html, text }) {
  const transporter = getTransporter();
  if (!transporter) {
    if (env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('[email:dev]', { to, subject, text });
      return { dev: true };
    }
    throw new Error('Email transporter not configured');
  }

  return transporter.sendMail({
    from: env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  });
}

module.exports = { sendEmail };

