const express = require('express');
const router = express.Router();
const {
  authUser,
  registerUser,
  sendOtp,
  verifyOtp,
  resetPassword,
  googleLogin,
  addAdminUser,
  getAdmins,
  updateUserStatus,
  deleteUser,
  handleContactForm
} = require('../controllers/authController');
const { protect, admin, superAdmin } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', authUser);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.post('/google', googleLogin);
router.post('/contact', handleContactForm);
router.post('/admin', protect, superAdmin, addAdminUser); // Only superadmin can add admins
router.get('/admins', protect, admin, getAdmins);

// Super Admin Routes
router.route('/:id').delete(protect, superAdmin, deleteUser);
router.route('/:id/status').put(protect, superAdmin, updateUserStatus);

module.exports = router;
