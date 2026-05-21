const nodemailer = require('nodemailer');
const axios = require('axios');
const dns = require('dns');
const util = require('util');

const resolve4 = util.promisify(dns.resolve4);

// Force Node.js to prefer IPv4 over IPv6 when resolving DNS (for Nodemailer fallback).
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

// Create Gmail transporter — reused across all sends
let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass || user === 'placeholder' || pass === 'placeholder') {
    return null;
  }

  try {
    // Dynamically resolve smtp.gmail.com to IPv4 only to bypass any IPv6 routing bugs on local/server
    const addresses = await resolve4('smtp.gmail.com');
    const ip = addresses[0] || '142.251.4.108';
    console.log(`[Email Service] Resolved smtp.gmail.com to IPv4: ${ip}`);

    transporter = nodemailer.createTransport({
      host: ip,
      port: 465,
      secure: true, 
      auth: { user, pass },
      tls: {
        servername: 'smtp.gmail.com' // Crucial for SSL/TLS verification
      },
      connectionTimeout: 10000, // 10s connection timeout
      greetingTimeout: 10000,   // 10s greeting timeout
      socketTimeout: 15000      // 15s socket timeout
    });
  } catch (err) {
    console.error(`[Email Service] Failed to dynamically resolve smtp.gmail.com to IPv4. Falling back to default hostname.`, err.message);

    // Fallback if DNS resolve4 fails
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, 
      auth: { user, pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000
    });
  }

  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  console.log(`\n📧 [Email Service] Attempting to send email...`);
  console.log(`   ➤ To      : ${to}`);
  console.log(`   ➤ Subject : ${subject}`);

  // 1. Prefer Brevo HTTP API (Port 443) if API Key is configured — Perfect for Render free tier!
  const brevoApiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.GMAIL_USER || 'avinashguleria1009@gmail.com';

  if (brevoApiKey && brevoApiKey !== 'placeholder') {
    console.log(`   ⏳ Sending via Brevo HTTP API (Port 443)...`);
    try {
      const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
        sender: { name: 'Kicks Store', email: senderEmail },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html
      }, {
        headers: {
          'accept': 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json'
        }
      });

      console.log(`✅ [Email Service] Email sent successfully via Brevo! Message ID: ${response.data.messageId || 'N/A'}`);
      return true;
    } catch (error) {
      console.error(`❌ [Email Service] Failed to send email via Brevo!`);
      console.error(`   ➤ Error: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }

  // 2. Fallback to Gmail SMTP (Nodemailer) — Perfect for local development!
  const mail = await getTransporter();
  if (mail) {
    console.log(`   ⏳ Sending via Gmail SMTP (Nodemailer)...`);
    try {
      const info = await mail.sendMail({
        from: `"Kicks Store" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html
      });

      console.log(`✅ [Email Service] Email sent successfully via SMTP! Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error(`❌ [Email Service] Failed to send email via SMTP!`);
      console.error(`   ➤ Error: ${error.message}`);
      return false;
    }
  }

  // 3. Fallback to Mock Mode if neither is configured
  console.warn(`⚠️  [Email Service] Neither Brevo nor Gmail credentials configured — MOCK mode. Email NOT sent.`);
  console.log(`   ➤ Add BREVO_API_KEY in your env to enable real emails on Render.`);
  return false;
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
