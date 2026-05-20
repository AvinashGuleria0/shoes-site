const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const { OAuth2Client } = require('google-auth-library');
const { sendEmail, sendWhatsApp } = require('../services/communicationService');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Auth user & get token
// @route   POST /api/users/login
const authUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (user && user.isActive) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = generateToken(res, user.id);
      return res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role.toLowerCase(),
        token
      });
    }
  }
  
  if (user && !user.isActive) {
     return res.status(401).json({ message: 'Account is pending verification or suspended. Please verify OTP.' });
  }

  res.status(401).json({ message: 'Invalid email or password' });
};

// @desc    Register a new user
// @route   POST /api/users
const registerUser = async (req, res) => {
  const { name, email, password, phone } = req.body;

  const userExists = await prisma.user.findUnique({ where: { email } });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      password: hashedPassword,
      isActive: false // Require OTP verification
    }
  });

  if (user) {
    const otpValue = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60000); 

    await prisma.otp.create({
      data: { email, otp: otpValue, type: 'VERIFY_EMAIL', expiresAt }
    });

    await sendEmail({
      to: email,
      subject: 'Verify your Kicks Account',
      html: `<h1>Welcome to Kicks!</h1><p>Your verification code is: <strong style="font-size:24px;">${otpValue}</strong></p><p>This code expires in 15 minutes.</p>`
    });

    if (phone) {
       await sendWhatsApp({ phone, message: `Hi ${name}, your Kicks verification OTP is: ${otpValue}` });
    }

    console.log(`[DEV MODE] Registration OTP for ${email}: ${otpValue}`);

    res.status(201).json({
      message: 'User registered. Please verify OTP sent to your email/whatsapp.',
      email: user.email
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Send OTP (Password Reset or Resend Verification)
// @route   POST /api/users/send-otp
const sendOtp = async (req, res) => {
  const { email, type } = req.body; 
  
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user && type === 'FORGOT_PASSWORD') {
     return res.status(404).json({ message: 'User not found' });
  }

  const otpValue = Math.floor(100000 + Math.random() * 900000).toString(); 
  const expiresAt = new Date(Date.now() + 15 * 60000); 

  await prisma.otp.create({
    data: { email, otp: otpValue, type: type || 'VERIFY_EMAIL', expiresAt }
  });

  const subject = type === 'FORGOT_PASSWORD' ? 'Kicks Password Reset' : 'Your Kicks Verification Code';
  const html = `<h1>Kicks Store</h1><p>Your one-time password is: <strong style="font-size:24px;">${otpValue}</strong></p><p>This code expires in 15 minutes.</p>`;

  await sendEmail({ to: email, subject, html });
  
  if (user && user.phone) {
    await sendWhatsApp({ phone: user.phone, message: `Your Kicks OTP is: ${otpValue}. Do not share this with anyone.` });
  }
  
  console.log(`[DEV MODE] OTP for ${email}: ${otpValue}`);
  res.status(200).json({ message: 'OTP sent successfully' });
};

// @desc    Verify OTP
// @route   POST /api/users/verify-otp
const verifyOtp = async (req, res) => {
  const { email, otp, type } = req.body;
  
  const otpRecord = await prisma.otp.findFirst({
    where: { email, otp, type: type || 'VERIFY_EMAIL', expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' }
  });

  if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });

  if (otpRecord.type === 'VERIFY_EMAIL') {
    const user = await prisma.user.update({
      where: { email },
      data: { isActive: true }
    });
    
    // Welcome Messages
    await sendEmail({
      to: user.email,
      subject: 'Welcome to Kicks!',
      html: `<h1>Welcome, ${user.name}!</h1><p>Your account is fully verified. Start shopping today!</p>`
    });
    
    if (user.phone) {
       await sendWhatsApp({ phone: user.phone, message: `Welcome to Kicks, ${user.name}! Your account is fully verified. 🎉` });
    }

    res.json({ 
       message: 'Account verified successfully', 
       _id: user.id,
       name: user.name,
       email: user.email,
       phone: user.phone,
       role: user.role.toLowerCase(),
       token: generateToken(res, user.id) 
    });
  } else {
    res.json({ message: 'OTP Verified. Proceed to reset password.' });
  }
};

// @desc    Reset Password
// @route   POST /api/users/reset-password
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  
  const otpRecord = await prisma.otp.findFirst({
    where: { email, otp, type: 'FORGOT_PASSWORD', expiresAt: { gt: new Date() } }
  });

  if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  });

  await prisma.otp.deleteMany({ where: { email, type: 'FORGOT_PASSWORD' } });

  res.json({ message: 'Password reset successful. You can now login.' });
};

// @desc    Google Auth
// @route   POST /api/users/google
const googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, sub: googleId } = ticket.getPayload();

    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { email },
          data: { googleId }
        });
      }
    } else {
      const dummyPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);
      user = await prisma.user.create({
        data: {
          name,
          email,
          googleId,
          password: dummyPassword,
          isActive: true // Google users don't need OTP verification
        }
      });
      
      // Send Welcome Message
      await sendEmail({
        to: user.email,
        subject: 'Welcome to Kicks!',
        html: `<h1>Welcome, ${user.name}!</h1><p>Thanks for joining via Google. Start shopping today!</p>`
      });
    }

    const jwtToken = generateToken(res, user.id);
    res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase(),
        token: jwtToken
    });

  } catch (error) {
    console.error(error);
    res.status(401).json({ 
      message: 'Google Auth Failed', 
      error: error.message 
    });
  }
};

// @desc    Admin: Add a new admin
// @route   POST /api/users/admin
const addAdminUser = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await prisma.user.findUnique({ where: { email } });

  if (userExists) {
    const dataToUpdate = { role: 'ADMIN' };
    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }
    const updatedUser = await prisma.user.update({
      where: { email },
      data: dataToUpdate
    });
    return res.json({ message: 'User updated to admin', user: updatedUser });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true
    }
  });

  res.status(201).json({
    _id: user.id,
    name: user.name,
    email: user.email,
    role: user.role.toLowerCase(),
  });
};

// @desc    Admin: Get all admins
// @route   GET /api/users/admins
const getAdmins = async (req, res) => {
  const admins = await prisma.user.findMany({
    where: {
      role: { in: ['ADMIN', 'SUPERADMIN'] }
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    }
  });
  
  // map to _id for frontend compatibility
  const formattedAdmins = admins.map(admin => ({
     ...admin,
     _id: admin.id,
     role: admin.role.toLowerCase()
  }));
  res.json(formattedAdmins);
};

// @desc    Update user status (Active/Inactive)
// @route   PUT /api/users/:id/status
const updateUserStatus = async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: req.body.isActive }
    });
    res.json({ message: `User status updated to ${user.isActive}` });
  } catch (error) {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'SUPERADMIN') {
       return res.status(400).json({ message: 'Cannot delete Super Admin' });
    }
    
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  authUser,
  registerUser,
  sendOtp,
  verifyOtp,
  resetPassword,
  googleLogin,
  addAdminUser,
  getAdmins,
  updateUserStatus,
  deleteUser
};
