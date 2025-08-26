import nodemailer from "nodemailer";
import { config } from "../config/env";

// Verify email configuration
const verifyEmailConfig = () => {
  if (!config.email.user || !config.email.pass) {
    console.error('Email configuration missing. Please check SMTP_USER and SMTP_PASS environment variables.');
    return false;
  }
  return true;
};

// Create transporter for Gmail SMTP
const createTransporter = () => {
  if (!verifyEmailConfig()) {
    throw new Error('Email configuration is incomplete');
  }

  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: false, // true for 465, false for other ports
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
    tls: {
      rejectUnauthorized: false, // Accept self-signed certificates
    },
  });
};

export const sendPasswordResetEmail = async (
  userEmail: string,
  token: string
): Promise<void> => {
  try {
    const transporter = createTransporter();
    
    // The reset URL should point to your frontend app's reset password page
    const resetUrl = `${config.cors.frontendUrl}/reset-password?token=${token}`;

    const mailOptions = {
      from: `"Learniqo" <${config.email.user}>`,
      to: userEmail,
      subject: "Password Reset Request",
      html: `
        <h1>Password Reset</h1>
        <p>You requested to reset your password. Click the button below to proceed:</p>
        <a href="${resetUrl}" style="background-color: #f44336; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block;">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
        <p>This link will expire in 1 hour for security reasons.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${userEmail}. Message ID: ${info.messageId}`);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error(`Failed to send password reset email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};


export const sendVerificationEmail = async (
  userEmail: string,
  token: string
): Promise<void> => {
  try {
    const transporter = createTransporter();
    
    // The verification URL should point to your frontend application
    const verificationUrl = `${config.cors.frontendUrl}/verify-email?token=${token}`;

    const mailOptions = {
      from: `"Learniqo" <${config.email.user}>`,
      to: userEmail,
      subject: "Verify Your Email Address",
      html: `
        <h1>Email Verification</h1>
        <p>Thank you for registering! Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block;">Verify Email</a>
        <p>If you did not create an account, please ignore this email.</p>
        <p>This verification link will expire in 24 hours.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${userEmail}. Message ID: ${info.messageId}`);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error(`Failed to send verification email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Test email configuration
export const testEmailConnection = async (): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email server connection verified successfully');
    return true;
  } catch (error) {
    console.error('Email server connection failed:', error);
    return false;
  }
};
