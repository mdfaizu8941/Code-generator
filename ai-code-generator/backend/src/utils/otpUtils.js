const crypto = require('crypto');

/**
 * Generates a cryptographically secure numeric OTP
 * @param {number} length - The length of the OTP to generate
 * @returns {string} The generated OTP
 */
const generateOtp = (length = 6) => {
  // We use crypto.randomInt for secure random generation
  // The max is 10^length (e.g., 10^6 = 1000000 for a 6-digit OTP)
  // We format it with leading zeros if necessary
  const min = 0;
  const max = Math.pow(10, length);
  const randomNumber = crypto.randomInt(min, max);
  
  return randomNumber.toString().padStart(length, '0');
};

module.exports = {
  generateOtp
};
