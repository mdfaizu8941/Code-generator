const User = require('../models/User');
const Otp = require('../models/Otp');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const { generateOtp } = require('../utils/otpUtils');

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });

  res
    .status(statusCode)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
};

// @desc    Send OTP for registration
// @route   POST /api/auth/send-register-otp
// @access  Public
exports.sendRegisterOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Please provide an email' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    // Rate Limiting: Check for an existing OTP requested recently (60s cooldown)
    const existingOtp = await Otp.findOne({ email }).sort({ createdAt: -1 });
    
    if (existingOtp) {
      const timeSinceLastOtp = (Date.now() - existingOtp.createdAt.getTime()) / 1000;
      if (timeSinceLastOtp < 60) {
        return res.status(429).json({ 
          success: false, 
          error: `Please wait ${Math.ceil(60 - timeSinceLastOtp)} seconds before requesting a new OTP.` 
        });
      }
    }

    // Generate secure 6-digit OTP
    const rawOtp = generateOtp(6);

    // Create OTP record (will be hashed automatically by pre-save hook)
    await Otp.create({ email, otp: rawOtp });

    // Send email via Brevo
    const emailSent = await sendEmail({
      email,
      subject: 'Verify your account',
      otp: rawOtp
    });

    if (!emailSent) {
      // If email failed to send, delete the created OTP to allow immediate retry
      await Otp.deleteMany({ email });
      return res.status(500).json({ success: false, error: 'Email could not be sent' });
    }

    res.status(200).json({ success: true, message: 'OTP sent to email successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Register user (Final step after OTP)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    if (!name || !email || !password || !otp) {
      return res.status(400).json({ success: false, error: 'Please provide all fields and OTP' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    // Find the most recent OTP for this email
    const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }

    // Verify OTP using matchOtp method
    const isMatch = await otpRecord.matchOtp(otp);

    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }

    // OTP is valid! Delete all OTPs for this email immediately to prevent reuse
    await Otp.deleteMany({ email });

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Send OTP for login (e.g. Resend OTP)
// @route   POST /api/auth/send-login-otp
// @access  Public
exports.sendLoginOtp = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Rate Limiting: Check for an existing OTP requested recently (60s cooldown)
    const existingOtp = await Otp.findOne({ email }).sort({ createdAt: -1 });
    if (existingOtp) {
      const timeSinceLastOtp = (Date.now() - existingOtp.createdAt.getTime()) / 1000;
      if (timeSinceLastOtp < 60) {
        return res.status(429).json({ 
          success: false, 
          error: `Please wait ${Math.ceil(60 - timeSinceLastOtp)} seconds before requesting a new OTP.` 
        });
      }
    }

    // Generate secure 6-digit OTP
    const rawOtp = generateOtp(6);
    await Otp.create({ email, otp: rawOtp });

    const emailSent = await sendEmail({
      email,
      subject: 'Login Verification',
      otp: rawOtp
    });

    if (!emailSent) {
      await Otp.deleteMany({ email });
      return res.status(500).json({ success: false, error: 'Email could not be sent' });
    }

    res.status(200).json({ success: true, message: 'OTP sent to email successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // If no OTP provided, trigger the OTP sending flow
    if (!otp) {
      // Generate secure 6-digit OTP
      const rawOtp = generateOtp(6);
      await Otp.create({ email, otp: rawOtp });

      const emailSent = await sendEmail({
        email,
        subject: 'Login Verification',
        otp: rawOtp
      });

      if (!emailSent) {
        await Otp.deleteMany({ email });
        return res.status(500).json({ success: false, error: 'Email could not be sent' });
      }

      return res.status(200).json({ success: true, requiresOtp: true, message: 'OTP verification required' });
    }

    // OTP was provided, verify it
    const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }

    const isOtpMatch = await otpRecord.matchOtp(otp);

    if (!isOtpMatch) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }

    // OTP is valid! Delete all OTPs for this email immediately
    await Otp.deleteMany({ email });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Send OTP to email
// @route   POST /api/auth/send-otp
// @access  Public
exports.requestOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Please provide an email' });
    }

    // Rate Limiting: Check for an existing OTP requested recently (60s cooldown)
    const existingOtp = await Otp.findOne({ email }).sort({ createdAt: -1 });
    
    if (existingOtp) {
      const timeSinceLastOtp = (Date.now() - existingOtp.createdAt.getTime()) / 1000;
      if (timeSinceLastOtp < 60) {
        return res.status(429).json({ 
          success: false, 
          error: `Please wait ${Math.ceil(60 - timeSinceLastOtp)} seconds before requesting a new OTP.` 
        });
      }
    }

    // Generate secure 6-digit OTP
    const rawOtp = generateOtp(6);

    // Create OTP record (will be hashed automatically by pre-save hook)
    await Otp.create({ email, otp: rawOtp });

    // Send email via Brevo
    const emailSent = await sendEmail({
      email,
      subject: 'Your Verification Code',
      otp: rawOtp
    });

    if (!emailSent) {
      // If email failed to send, delete the created OTP to allow immediate retry
      await Otp.deleteMany({ email });
      return res.status(500).json({ success: false, error: 'Email could not be sent' });
    }

    res.status(200).json({ success: true, message: 'OTP sent to email successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Please provide an email and OTP' });
    }

    // Find the most recent OTP for this email
    const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }

    // Verify OTP using matchOtp method
    const isMatch = await otpRecord.matchOtp(otp);

    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }

    // OTP is valid! Delete all OTPs for this email immediately to prevent reuse
    await Otp.deleteMany({ email });

    res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Request Password Reset OTP
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Please provide an email' });

    const userExists = await User.findOne({ email });
    // Generic success message to prevent email enumeration
    const successMessage = 'If an account with this email exists, a password reset OTP has been sent.';

    if (!userExists) {
      return res.status(200).json({ success: true, message: successMessage });
    }

    const existingOtp = await Otp.findOne({ email, purpose: 'PASSWORD_RESET' }).sort({ createdAt: -1 });
    if (existingOtp) {
      const timeSinceLastOtp = (Date.now() - existingOtp.createdAt.getTime()) / 1000;
      if (timeSinceLastOtp < 60) {
        return res.status(429).json({ success: false, error: `Please wait ${Math.ceil(60 - timeSinceLastOtp)} seconds before requesting a new OTP.` });
      }
    }

    const rawOtp = generateOtp(6);
    await Otp.create({ email, otp: rawOtp, purpose: 'PASSWORD_RESET' });

    const emailSent = await sendEmail({
      email,
      subject: 'Password Reset Verification',
      otp: rawOtp
    });

    if (!emailSent) {
      await Otp.deleteMany({ email, purpose: 'PASSWORD_RESET' });
      return res.status(500).json({ success: false, error: 'Email could not be sent' });
    }

    res.status(200).json({ success: true, message: successMessage });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Verify Password Reset OTP
// @route   POST /api/auth/verify-reset-otp
// @access  Public
exports.verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, error: 'Please provide email and OTP' });

    const otpRecord = await Otp.findOne({ email, purpose: 'PASSWORD_RESET' }).sort({ createdAt: -1 });
    if (!otpRecord) return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });

    const isMatch = await otpRecord.matchOtp(otp);
    if (!isMatch) return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });

    // Do NOT delete the OTP here, as we need it for the actual reset step.
    res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) return res.status(400).json({ success: false, error: 'Please provide all fields' });
    if (password.length < 6) return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });

    const otpRecord = await Otp.findOne({ email, purpose: 'PASSWORD_RESET' }).sort({ createdAt: -1 });
    if (!otpRecord) return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });

    const isMatch = await otpRecord.matchOtp(otp);
    if (!isMatch) return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, error: 'User not found' });

    user.password = password;
    await user.save();

    await Otp.deleteMany({ email, purpose: 'PASSWORD_RESET' });

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Resend Password Reset OTP
// @route   POST /api/auth/resend-reset-otp
// @access  Public
exports.resendResetOtp = exports.forgotPassword;
