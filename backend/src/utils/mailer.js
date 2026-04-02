const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

async function sendMail({ to, subject, text, html }) {
  const t = getTransporter();
  if (!t) {
    console.log('[mailer] SMTP not configured — email skipped');
    console.log(`[mailer] To: ${to} | Subject: ${subject}`);
    return true;
  }

  await t.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });

  return true;
}

async function sendReceiptEmail({ to, orderId, items, subtotal, currency }) {
  const itemLines = (items || [])
    .map(i => `  - ${i.title} x${i.qty || 1}: ${currency || 'ZAR'} ${i.price}`)
    .join('\n');

  const subject = `ArtCollab Order Receipt — #${orderId}`;
  const text = `Thank you for your purchase!\n\nOrder ID: ${orderId}\n\nItems:\n${itemLines}\n\nTotal: ${currency || 'ZAR'} ${subtotal}\n\nYour order has been confirmed.`;

  return sendMail({ to, subject, text });
}

module.exports = sendMail;
module.exports.sendMail = sendMail;
module.exports.sendReceiptEmail = sendReceiptEmail;
