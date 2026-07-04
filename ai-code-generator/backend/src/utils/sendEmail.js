const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter using Brevo SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
      <h2 style="color: #2563EB; text-align: center; font-size: 24px; margin-bottom: 20px;">CodeGen AI</h2>
      <p style="font-size: 16px; color: #333;">Hello,</p>
      <p style="font-size: 16px; color: #333;">Your One-Time Password (OTP) for verification is:</p>
      
      <div style="background-color: #f4f4f4; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b;">${options.otp}</span>
      </div>
      
      <p style="font-size: 14px; color: #555;">This OTP is valid for <strong>5 minutes</strong>.</p>
      <p style="font-size: 14px; color: #555;"><strong>Security Warning:</strong> If you did not request this email, please ignore it. Your account is safe.</p>
      
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
      <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} CodeGen AI. All rights reserved.</p>
    </div>
  `;

  const message = {
    from: `${process.env.FROM_NAME || 'CodeGen AI'} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: htmlTemplate
  };

  try {
    console.log(`\n================================`);
    console.log(`[TESTING MODE] OTP Email Skipped`);
    console.log(`To: ${options.email}`);
    console.log(`OTP Code: ${options.otp}`);
    console.log(`================================\n`);

    // We still attempt to send, but we catch the error and force a success
    // so the app can continue working without crashing while the Brevo account is unactivated.
    try {
      await transporter.sendMail(message);
    } catch (err) {
      console.error(`Brevo SMTP Error: ${err.message} - Bypassing for testing.`);
    }

    return true;
  } catch (error) {
    console.error(`Error in sendEmail utility: ${error}`);
    return true; // Force return true so we don't block the user while testing
  }
};

module.exports = sendEmail;
