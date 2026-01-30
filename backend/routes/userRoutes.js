const express = require('express');
const router = express.Router();
const {
  authUser,
  registerUser,
  sendOtp,
  googleLogin,
  addAdminUser,
  getAdmins
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', authUser);
router.post('/send-otp', sendOtp);
router.post('/google', googleLogin);
router.post('/admin', protect, admin, addAdminUser);
router.get('/admins', protect, admin, getAdmins);

module.exports = router;
