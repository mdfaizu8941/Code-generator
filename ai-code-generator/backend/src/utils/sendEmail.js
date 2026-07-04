const { BrevoClient } = require('@getbrevo/brevo');

const sendEmail = async (options) => {
  const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

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

  try {
    console.log(`\n================================`);
    console.log(`[EMAIL API] OTP Email Prepared`);
    console.log(`To: ${options.email}`);
    console.log(`OTP Code: ${options.otp}`);
    console.log(`================================\n`);

    const data = await client.transactionalEmails.sendTransacEmail({
      subject: options.subject,
      htmlContent: htmlTemplate,
      sender: {
        name: process.env.BREVO_SENDER_NAME || 'CodeGen AI',
        email: process.env.BREVO_SENDER_EMAIL
      },
      to: [{ email: options.email }]
    });
    
    console.log(`Brevo API Email sent successfully.`);
    return true;
  } catch (error) {
    console.error(`Error in sendEmail utility using Brevo API: ${error}`);
    // Return false to indicate failure, which the controller handles correctly
    return false; 
  }
};

module.exports = sendEmail;
