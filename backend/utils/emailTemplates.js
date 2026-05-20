/**
 * Generates the HTML welcome email template for Kicks Store
 * @param {string} name - Name of the user
 * @param {string} frontendUrl - Frontend application URL
 * @returns {string} HTML string
 */
const getWelcomeEmailTemplate = (name, frontendUrl) => {
  const resolvedUrl = frontendUrl || 'https://kicks-shoestore.vercel.app';
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Kicks</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #09090b;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #ffffff;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #09090b;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #18181b;
      border-radius: 24px;
      border: 1px solid #27272a;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .header {
      padding: 40px 40px 20px;
      text-align: center;
      background: linear-gradient(135deg, #18181b 0%, #09090b 100%);
    }
    .logo-container {
      display: inline-block;
      padding: 8px 24px;
      border-radius: 12px;
      border: 1px solid rgba(249, 115, 22, 0.2);
      background-color: rgba(249, 115, 22, 0.05);
      margin-bottom: 20px;
    }
    .logo-text {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 4px;
      color: #f97316;
      text-decoration: none;
    }
    .hero-gif {
      width: 100%;
      max-width: 280px;
      height: auto;
      display: block;
      margin: 0 auto 20px;
      filter: drop-shadow(0 15px 30px rgba(249, 115, 22, 0.35));
    }
    .content {
      padding: 0 40px 40px;
      text-align: center;
    }
    h1 {
      font-size: 28px;
      font-weight: 900;
      margin-top: 0;
      margin-bottom: 15px;
      letter-spacing: -0.5px;
      color: #ffffff;
      text-transform: uppercase;
    }
    .accent-text {
      color: #f97316;
    }
    p {
      font-size: 15px;
      line-height: 1.6;
      color: #a1a1aa;
      margin-bottom: 30px;
    }
    .btn-container {
      margin-bottom: 40px;
    }
    .btn {
      display: inline-block;
      padding: 16px 36px;
      background-color: #f97316;
      color: #ffffff !important;
      font-size: 15px;
      font-weight: 800;
      text-transform: uppercase;
      text-decoration: none;
      letter-spacing: 1px;
      border-radius: 14px;
      box-shadow: 0 10px 20px rgba(249, 115, 22, 0.3);
    }
    .features {
      border-top: 1px solid #27272a;
      padding-top: 30px;
      margin-top: 30px;
      text-align: left;
    }
    .feature-item {
      display: inline-block;
      width: 45%;
      margin: 10px 2%;
      vertical-align: top;
    }
    .feature-title {
      font-size: 13px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .feature-desc {
      font-size: 12px;
      color: #71717a;
      margin: 0;
    }
    .footer {
      background-color: #09090b;
      padding: 30px 40px;
      text-align: center;
      border-top: 1px solid #27272a;
    }
    .footer-text {
      font-size: 12px;
      color: #52525b;
      line-height: 1.5;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo-container">
          <span class="logo-text">KICKS</span>
        </div>
        <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3hmdWw1N3FhMnZhbW93bzNhNTlyeXU3dWZidTFhdDRtY2U4ZXppNCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/X83Y7r03T6BnFf7hxR/giphy.gif" alt="Sneaker Bounce" class="hero-gif">
      </div>
      <div class="content">
        <h1>YOU'RE IN THE CLUB, <span class="accent-text">${name.toUpperCase()}</span>!</h1>
        <p>Your Kicks account is fully verified and ready. Step into next-level comfort and style with our elite curation of the freshest drops. We've got the latest styles and exclusive collections waiting for you.</p>
        <div class="btn-container">
          <a href="${resolvedUrl}/shop" class="btn" target="_blank">Shop New Drops</a>
        </div>
        <div class="features">
          <div class="feature-item">
            <div class="feature-title">⚡ Free Shipping</div>
            <p class="feature-desc">On orders over ₹2000</p>
          </div>
          <div class="feature-item">
            <div class="feature-title">🔄 Easy Returns</div>
            <p class="feature-desc">30-day hassle-free returns</p>
          </div>
          <div class="feature-item">
            <div class="feature-title">📞 24/7 Support</div>
            <p class="feature-desc">Always here to help you</p>
          </div>
          <div class="feature-item">
            <div class="feature-title">⭐ 100% Authentic</div>
            <p class="feature-desc">Genuine brands guaranteed</p>
          </div>
        </div>
      </div>
      <div class="footer">
        <p class="footer-text">© 2026 KICKS Store. All rights reserved.<br>Made with ❤️ for the Sneaker Community.<br>If you have any questions, reply to this email or reach out to support@kicks.com</p>
      </div>
    </div>
  </div>
</body>
</html>`;
};

module.exports = { getWelcomeEmailTemplate };
