const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const token = generateToken(res, user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    const token = generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Send OTP (Mock for Whapi)
// @route   POST /api/users/send-otp
// @access  Public
const sendOtp = async (req, res) => {
  const { phone } = req.body;
  
  // Here we would use Whapi API
  // if (process.env.WHAPI_API_TOKEN !== 'placeholder') {
  //   // Call Whapi...
  // }
  
  const otp = Math.floor(100000 + Math.random() * 900000); // 6 digit
  console.log(`[DEV MODE] OTP for ${phone}: ${otp}`);
  
  // In a real app, store OTP in redis/db with expiration
  // For this demo, we might just return it or rely on the fact the user sees it in console
  
  res.status(200).json({ message: 'OTP sent successfully', otp: process.env.NODE_ENV === 'development' ? otp : undefined });
};

// @desc    Google Auth
// @route   POST /api/users/google
// @access  Public
const googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, sub: googleId } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (user) {
      // User exists, just log them in
      // Optionally update googleId if not present
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Create new user
      // Note: We don't have a password. 
      user = await User.create({
        name,
        email,
        googleId,
        password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8), // Dummy password
      });
    }

    if (user) {
        const token = generateToken(res, user._id);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }

  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Google Auth Failed' });
  }
};

// @desc    Admin: Add a new admin
// @route   POST /api/users/admin
// @access  Private/Admin
const addAdminUser = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    userExists.role = 'admin';
    if (password) userExists.password = password;
    await userExists.save();
    return res.json({ message: 'User updated to admin', user: userExists });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'admin'
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Admin: Get all admins
// @route   GET /api/users/admins
// @access  Private/Admin
const getAdmins = async (req, res) => {
  const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } }).select('-password');
  res.json(admins);
};

module.exports = {
  authUser,
  registerUser,
  sendOtp,
  googleLogin,
  addAdminUser,
  getAdmins
};
