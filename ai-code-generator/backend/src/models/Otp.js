const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please add an email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  otp: {
    type: String,
    required: [true, 'Please add an OTP']
  },
  purpose: {
    type: String,
    enum: ['VERIFICATION', 'PASSWORD_RESET'],
    default: 'VERIFICATION'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Increased from 5 to 10 minutes (600 seconds) for both cases as standard
  }
});

// Encrypt OTP using bcrypt
otpSchema.pre('save', async function(next) {
  if (!this.isModified('otp')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.otp = await bcrypt.hash(this.otp, salt);
});

// Match user entered OTP to hashed OTP in database
otpSchema.methods.matchOtp = async function(enteredOtp) {
  return await bcrypt.compare(enteredOtp, this.otp);
};

module.exports = mongoose.model('Otp', otpSchema);
