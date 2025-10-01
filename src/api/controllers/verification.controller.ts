import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { sendVerificationEmail } from '../../services/email.service';
import { SecretCodeService } from '../../services/secretCode.service';

// POST /verification/verify-email
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code } = req.body;

    // Validate required fields
    if (!email || !code) {
      res.status(400).json({ 
        message: "Email and verification code are required.",
        errors: {
          email: !email ? "Email is required" : undefined,
          code: !code ? "Verification code is required" : undefined
        }
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: "Invalid email format." });
      return;
    }

    // Validate verification code format (6 digits)
    const codeRegex = /^\d{6}$/;
    if (!codeRegex.test(code)) {
      res.status(400).json({ message: "Verification code must be 6 digits." });
      return;
    }

    // Find user by email and verification code
    const user = await prisma.user.findFirst({
      where: { 
        email: email.toLowerCase().trim(),
        verificationCode: code,
        isVerified: false // Only allow verification for unverified users
      },
    });

    if (!user) {
      res.status(400).json({ 
        message: "Invalid email or verification code, or email already verified." 
      });
      return;
    }

    // Check if verification code has expired
    if (user.verificationExpires && user.verificationExpires < new Date()) {
      res.status(400).json({ 
        message: "Verification code has expired. Please request a new one." 
      });
      return;
    }

    // Update user to verified status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationCode: null,
        verificationExpires: null,
      },
    });

    res.status(200).json({
      message: "Email verified successfully! Please complete your profile to continue.",
      userId: user.id,
      role: user.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// POST /verification/resend-verification
export const resendVerificationCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      res.status(400).json({ message: "Email is required." });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: "Invalid email format." });
      return;
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      res.status(200).json({ 
        message: "If the email exists and is not verified, a new verification code has been sent." 
      });
      return;
    }

    // Check if user is already verified
    if (user.isVerified) {
      res.status(400).json({ message: "Email is already verified." });
      return;
    }

    // Generate new verification code
    const newVerificationCode = SecretCodeService.generateVerificationCode();
    const newVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Update user with new verification code
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode: newVerificationCode,
        verificationExpires: newVerificationExpires,
      },
    });

    // Send new verification email
    await sendVerificationEmail(user.email, newVerificationCode);

    res.status(200).json({
      success: true,
      message: "A new verification code has been sent to your email."
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};