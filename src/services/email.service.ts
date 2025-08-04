import nodemailer from "nodemailer";
//import dotenv from "dotenv";

//dotenv.config({ path: "../../../user-service/.env" }); // Load environment variables from .env file

// Create transporter for Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // Your company Gmail, e.g. yourcompany@gmail.com
    pass: process.env.GMAIL_APP_PASSWORD, // Your Gmail app password (16-char code)
  },
});

export const sendPasswordResetEmail = async (
  userEmail: string,
  token: string
): Promise<void> => {
  // The reset URL should point to your frontend app's reset password page
  const resetUrl = `http://localhost:3000/reset-password?token=${token}`;

  const mailOptions = {
    from: `"Learniqo" <${process.env.GMAIL_USER}>`, // Your Gmail here
    to: userEmail,
    subject: "Password Reset Request",
    html: `
      <h1>Password Reset</h1>
      <p>You requested to reset your password. Click the button below to proceed:</p>
      <a href="${resetUrl}" style="background-color: #f44336; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block;">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending password reset email:", error);
  }
};


export const sendVerificationEmail = async (
  userEmail: string,
  token: string
): Promise<void> => {
  // The verification URL should point to your frontend application
  const verificationUrl = `http://localhost:3000/verify-email?token=${token}`;

  const mailOptions = {
    from: `"Learniqo" <${process.env.GMAIL_USER}>`, // Use your Gmail here
    to: userEmail,
    subject: "Verify Your Email Address",
    html: `
      <h1>Email Verification</h1>
      <p>Thank you for registering! Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block;">Verify Email</a>
      <p>If you did not create an account, please ignore this email.</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
};
