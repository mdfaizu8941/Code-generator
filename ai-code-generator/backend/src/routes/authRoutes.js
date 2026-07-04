const express = require('express');
const { register, login, getProfile, updateProfile, requestOtp, verifyOtp, sendRegisterOtp, sendLoginOtp } = require('../controllers/authController');
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

module.exports = router;
