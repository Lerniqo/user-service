import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { validationResult } from "express-validator";
import prisma from "../../config/prisma";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../../services/email.service";
import { SecretCodeService } from "../../services/secretCode.service";
import {
  AuthenticatedRequest,
  LoginResponse,
  UserProfileResponse,
} from "../../types";

// @desc    Register a new user
// @route   POST /api/auth/register
export const register = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const {
      email,
      password,
      role = "Student",
      firstName,
      lastName,
      gradeLevel,
      qualifications,
    } = req.body;
    
    const fullName = `${firstName} ${lastName}`;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ message: "User with this email already exists." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationCode = SecretCodeService.generateVerificationCode();

    // Create user with unified model
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role as "Student" | "Teacher" | "Admin",
        fullName,
        gradeLevel: role === "Student" ? gradeLevel : null,
        qualifications: role === "Teacher" ? qualifications : null,
        verificationCode,
      },
    });

    await sendVerificationEmail(user.email, verificationCode);

    res.status(201).json({
      message: "Registration successful! Please check your email to verify your account.",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Verify email
// @route   POST /api/auth/verify-email
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.body;

    if (!code) {
      res.status(400).json({ message: "Verification code is required." });
      return;
    }

    const user = await prisma.user.findFirst({
      where: { verificationCode: code },
    });

    if (!user) {
      res.status(400).json({ message: "Invalid or expired verification code." });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationCode: null,
      },
    });

    res.status(200).json({ 
      message: "Email verified successfully! You can now log in." 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ 
      where: { email } 
    });

    if (!user) {
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }

    if (!user.isVerified) {
      res.status(401).json({ 
        message: "Email not verified. Please check your inbox." 
      });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }

    // Generate session code using the new service
    const sessionCode = SecretCodeService.generateSessionCode(
      user.id, 
      user.email, 
      user.role
    );

    const response: LoginResponse = {
      message: "Login successful!",
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    res.status(200).json({
      ...response,
      sessionCode,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.user;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    const profileData: UserProfileResponse = {
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      gradeLevel: user.gradeLevel || undefined,
      learningGoals: user.learningGoals || undefined,
      qualifications: user.qualifications || undefined,
      experienceSummary: user.experienceSummary || undefined,
      profileImage: user.profileImage || undefined,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json(profileData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // With session codes, we don't need to do anything on the server side
    // The session code will expire naturally
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ message: "Email is required." });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ 
      where: { email } 
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      res.status(200).json({
        message: "If the email exists, a password reset link has been sent.",
      });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetCode: resetToken,
        passwordResetExpires: resetTokenExpiry,
      },
    });

    await sendPasswordResetEmail(email, resetToken);

    res.status(200).json({
      message: "If the email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    res.status(400).json({ message: "Token and new password are required." });
    return;
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetCode: token,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      res.status(400).json({ 
        message: "Invalid or expired password reset token." 
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetCode: null,
        passwordResetExpires: null,
      },
    });

    res.status(200).json({
      message: "Password has been reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
