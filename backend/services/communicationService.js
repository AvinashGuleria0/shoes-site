const { Resend } = require('resend');
const axios = require('axios');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  console.log(`\n📧 [Email Service] Attempting to send email...`);
  console.log(`   ➤ To      : ${to}`);
  console.log(`   ➤ Subject : ${subject}`);
  console.log(`   ➤ API Key : ${process.env.RESEND_API_KEY ? `SET (${process.env.RESEND_API_KEY.slice(0, 8)}...)` : 'NOT SET ❌'}`);

  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'placeholder') {
      console.warn(`⚠️  [Email Service] No valid API key found — running in MOCK mode. Email NOT sent.`);
      console.log(`   [Mock Email] To: ${to} | Subject: ${subject}`);
      return true;
    }

    console.log(`   ➤ From    : Kicks Store <avinash.guleria.s84@kalvium.community>`);
    console.log(`   ⏳ Sending via Resend...`);

    const result = await resend.emails.send({
      from: 'Kicks Store <onboarding@resend.dev>',
      to,
      subject,
      html
    });

    console.log(`📬 [Email Service] Raw Resend response:`, JSON.stringify(result, null, 2));

    if (result?.error) {
      console.error(`❌ [Email Service] Resend returned an error inside response!`);
      console.error(`   ➤ Error:`, result.error);
      return false;
    }

    const emailId = result?.data?.id || result?.id;
    console.log(`✅ [Email Service] Email sent successfully! ID: ${emailId || 'N/A (check raw response above)'}`);
    return true;
  } catch (error) {
    console.error(`❌ [Email Service] FAILED to send email!`);
    console.error(`   ➤ Error Message : ${error.message}`);
    console.error(`   ➤ Error Name    : ${error.name}`);
    console.error(`   ➤ Full Error    :`, error);
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
