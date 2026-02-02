const express = require('express');
const router = express.Router();
const {
  authUser,
  registerUser,
  sendOtp,
  googleLogin,
  addAdminUser,
  getAdmins,
  updateUserStatus,
  deleteUser
} = require('../controllers/authController');
const { protect, admin, superAdmin } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', authUser);
router.post('/send-otp', sendOtp);
router.post('/google', googleLogin);
router.post('/admin', protect, superAdmin, addAdminUser); // Only superadmin can add admins
router.get('/admins', protect, admin, getAdmins);

// Super Admin Routes
router.route('/:id').delete(protect, superAdmin, deleteUser);
router.route('/:id/status').put(protect, superAdmin, updateUserStatus);

module.exports = router;
