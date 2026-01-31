const nodemailer = require("nodemailer");

function hasEmailEnv() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.MAIL_FROM
  );
}

function getTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendReceiptEmail({ to, order, paymentIntentId }) {
  if (!hasEmailEnv()) {
    console.log("[email] SMTP env not set - skipping email");
    return { skipped: true };
  }

  const items = (order.items || [])
    .map(i => `- ${i.title} x${i.qty} = ${i.price} ${order.currency}`)
    .join("\n");

  const text = `Thanks for your purchase!

Order: ${order._id}
Total: ${order.subtotal} ${order.currency}
Payment: ${paymentIntentId}

Items:
${items}
`;

  const transporter = getTransport();

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: `Receipt - Order ${order._id}`,
    text,
  });

  console.log("[email] Receipt sent:", info.messageId);
  return info;
}

module.exports = { sendReceiptEmail };
