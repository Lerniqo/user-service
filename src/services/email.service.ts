import nodemailer from "nodemailer";
import { config } from "../config/env";
import { log } from "../config/logger";

// Verify email configuration
const verifyEmailConfig = () => {
  if (!config.email.user || !config.email.pass) {
    log.error('Email configuration missing', undefined, {
      hasUser: !!config.email.user,
      hasPass: !!config.email.pass,
      host: config.email.host,
      port: config.email.port
    });
    return false;
  }
  return true;
};

// Create transporter for Gmail SMTP
const createTransporter = () => {
  if (!verifyEmailConfig()) {
    const error = new Error('Email configuration is incomplete');
    log.error('Failed to create email transporter', error);
    throw error;
  }

  log.debug('Creating email transporter', {
    host: config.email.host,
    port: config.email.port,
    user: config.email.user?.substring(0, 5) + '***' // Log partial email for debugging
  });

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
  const startTime = Date.now();
  
  try {
    log.info('Sending password reset email', { email: userEmail });
    
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
    
    const responseTime = Date.now() - startTime;
    log.info('Password reset email sent successfully', {
      email: userEmail,
      messageId: info.messageId,
      responseTime: `${responseTime}ms`
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    log.error('Failed to send password reset email', error, {
      email: userEmail,
      responseTime: `${responseTime}ms`
    });
    throw new Error(`Failed to send password reset email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const sendVerificationEmail = async (
  userEmail: string,
  verificationCode: string
): Promise<void> => {
  const startTime = Date.now();
  
  try {
    log.info('Sending verification email', { email: userEmail });
    
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
          
          <p style="font-size: 14px; color: #777; text-align: center;">
            This verification code will expire in 24 hours for security reasons.
          </p>
          
          <p style="font-size: 14px; color: #777; text-align: center;">
            If you did not create an account with Learniqo, please ignore this email.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
    const responseTime = Date.now() - startTime;
    log.info('Verification email sent successfully', {
      email: userEmail,
      messageId: info.messageId,
      responseTime: `${responseTime}ms`
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    log.error('Failed to send verification email', error, {
      email: userEmail,
      responseTime: `${responseTime}ms`
    });
    throw new Error(`Failed to send verification email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const testEmailConnection = async (): Promise<boolean> => {
  try {
    log.info('Testing email connection');
    
    const transporter = createTransporter();
    await transporter.verify();
    
    log.info('Email connection test successful');
    return true;
  } catch (error) {
    log.error('Email connection test failed', error);
    return false;
  }
};
