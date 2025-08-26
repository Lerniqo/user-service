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
  verificationCode: string
): Promise<void> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Learniqo" <${config.email.user}>`,
      to: userEmail,
      subject: "Verify Your Email Address",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; text-align: center;">Email Verification</h1>
          <p style="font-size: 16px; color: #555;">Thank you for registering with Learniqo! Please use the verification code below to verify your email address:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f8f9fa; border: 2px solid #4CAF50; border-radius: 8px; padding: 20px; display: inline-block;">
              <h2 style="margin: 0; color: #4CAF50; font-size: 32px; letter-spacing: 8px; font-weight: bold;">${verificationCode}</h2>
            </div>
          </div>
          
          <p style="font-size: 14px; color: #666; text-align: center;">Enter this code in the verification form to complete your registration.</p>
          <p style="font-size: 14px; color: #666; text-align: center;">If you did not create an account, please ignore this email.</p>
          <p style="font-size: 12px; color: #999; text-align: center;">This verification code will expire in 24 hours.</p>
        </div>
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
