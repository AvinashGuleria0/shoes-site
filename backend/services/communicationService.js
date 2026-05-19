const { Resend } = require('resend');
const axios = require('axios');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'placeholder') {
      console.log(`[Mock Email] To: ${to} | Subject: ${subject}`);
      return true;
    }

    await resend.emails.send({
      from: 'Kicks Store <onboarding@resend.dev>', // Update this when you have a custom domain on Resend
      to,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error('Email Service Error:', error.message);
    return false;
  }
};

const sendWhatsApp = async ({ phone, message }) => {
  if (!process.env.WHAPI_TOKEN || process.env.WHAPI_TOKEN === 'placeholder' || !phone) {
    console.log(`[Mock WhatsApp] To: ${phone} | Message: ${message}`);
    return false;
  }

  try {
    // Ensure phone number has country code (assuming India 91 if not provided)
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
