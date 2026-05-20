const nodemailer = require('nodemailer');
const axios = require('axios');
const dns = require('dns');

// Force Node.js to prefer IPv4 over IPv6 when resolving DNS. 
// This fixes ENETUNREACH / connection timeout errors on platforms like Render where IPv6 routing is unavailable.
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

// Create Gmail transporter — reused across all sends
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass || user === 'placeholder' || pass === 'placeholder') {
    return null;
  }

  // Explicit SMTPS over port 465 with robust timeouts
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, 
    auth: { user, pass },
    connectionTimeout: 10000, // 10s connection timeout
    greetingTimeout: 10000,   // 10s greeting timeout
    socketTimeout: 15000      // 15s socket timeout
  });

  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  console.log(`\n📧 [Email Service] Attempting to send email...`);
  console.log(`   ➤ To      : ${to}`);
  console.log(`   ➤ Subject : ${subject}`);

  const mail = getTransporter();

  if (!mail) {
    console.warn(`⚠️  [Email Service] Gmail credentials not configured — MOCK mode. Email NOT sent.`);
    console.log(`   ➤ Set GMAIL_USER and GMAIL_APP_PASSWORD in your .env to enable real emails.`);
    return false;
  }

  try {
    const info = await mail.sendMail({
      from: `"Kicks Store" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html
    });

    console.log(`✅ [Email Service] Email sent! Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ [Email Service] Failed to send email!`);
    console.error(`   ➤ Error: ${error.message}`);
    return false;
  }
};

const sendWhatsApp = async ({ phone, message }) => {
  if (!process.env.WHAPI_TOKEN || process.env.WHAPI_TOKEN === 'placeholder' || !phone) {
    console.log(`[Mock WhatsApp] To: ${phone} | Message: ${message}`);
    return false;
  }

  try {
    let formattedPhone = phone.toString();
    if (formattedPhone.length === 10) formattedPhone = `91${formattedPhone}`;

    await axios.post('https://panel.whapi.cloud/api/messages/text', {
      to: `${formattedPhone}@s.whatsapp.net`,
      body: message
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.WHAPI_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    return true;
  } catch (error) {
    console.error('WhatsApp Service Error:', error.response?.data || error.message);
    return false;
  }
};

module.exports = { sendEmail, sendWhatsApp };
