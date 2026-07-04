const express = require('express');
const { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  requestOtp, 
  verifyOtp, 
  sendRegisterOtp, 
  sendLoginOtp,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  resendResetOtp
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/send-register-otp', sendRegisterOtp);
router.post('/send-login-otp', sendLoginOtp);
router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Password Reset Routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);
router.post('/resend-reset-otp', resendResetOtp);

module.exports = router;
