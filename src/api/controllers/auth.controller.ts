import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import prisma from '../../config/prisma';
import { sendVerificationEmail } from '../../services/email.service';
import { SecretCodeService } from '../../services/secretCode.service';
import crypto from 'crypto';
import { log } from '../../config/logger';
import { AuthenticatedRequest } from '../../types';

// POST /auth/register - Step 1: Basic registration
export const register = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const { email, role = "Student" } = req.body;
  
  log.info('User registration attempt', { 
    email: email?.toLowerCase(), 
    role, 
    ip: req.ip 
  });

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    log.warn('Registration validation failed', { 
      email: email?.toLowerCase(), 
      errors: errors.array(),
      ip: req.ip 
    });
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { 
      email, 
      password, 
      role = "Student"
    } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      log.warn('Registration attempt with existing email', { 
        email: email.toLowerCase(), 
        existingUserId: existingUser.id,
        ip: req.ip 
      });
      res.status(400).json({ message: "User with this email already exists." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationCode = SecretCodeService.generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Create user with basic information only
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role as "Student" | "Teacher" | "Admin",
        fullName: "", // Will be set in step 2
        verificationCode,
        verificationExpires,
        isVerified: false,
      },
    });

    log.database('User created', 'user', Date.now() - startTime, {
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // Send verification email
    await sendVerificationEmail(user.email, verificationCode);
    
    log.info('Verification email sent', { 
      userId: user.id, 
      email: user.email 
    });

    const responseTime = Date.now() - startTime;
    log.info('User registration successful', { 
      userId: user.id, 
      email: user.email, 
      role: user.role, 
      responseTime: `${responseTime}ms`,
      ip: req.ip 
    });

    res.status(201).json({
      userId: user.id,
      email: user.email,
      role: user.role,
      message: "Registration successful! Please check your email to verify your account before completing your profile."
    });
  } catch (error) {
    log.error('User registration failed', error, { 
      email: email?.toLowerCase(), 
      role, 
      ip: req.ip,
      responseTime: `${Date.now() - startTime}ms`
    });
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// POST /auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const { email } = req.body;
  
  log.info('User login attempt', { 
    email: email?.toLowerCase(), 
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    log.warn('Login validation failed', { 
      email: email?.toLowerCase(), 
      errors: errors.array(),
      ip: req.ip 
    });
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      log.security('Login attempt with non-existent email', { 
        email: email.toLowerCase(), 
        ip: req.ip 
      });
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }

    if (!user.isVerified) {
      log.warn('Login attempt with unverified email', { 
        userId: user.id,
        email: user.email, 
        ip: req.ip 
      });
      res.status(401).json({
        message: "Email not verified. Please check your inbox."
      });
      return;
    }

    if (user.fullName === "") {
      log.warn('Login attempt with incomplete profile', { 
        userId: user.id,
        email: user.email, 
        ip: req.ip 
      });
      res.status(401).json({
        message: "Profile not completed. Please complete your profile first.",
        userId: user.id,
        profileCompleted: false
      });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      log.security('Login attempt with incorrect password', { 
        userId: user.id,
        email: user.email, 
        ip: req.ip 
      });
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }

    // Generate access and refresh tokens
    const accessToken = SecretCodeService.generateSessionCode(user.id, user.email, user.role);
    const refreshToken = crypto.randomBytes(32).toString('hex');

    // Store refresh token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshTokens: {
          push: refreshToken
        }
      }
    });

    log.database('Refresh token stored', 'user', Date.now() - startTime, {
      userId: user.id
    });

    // Set HTTP-only cookies
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const responseTime = Date.now() - startTime;
    log.info('User login successful', { 
      userId: user.id,
      email: user.email, 
      role: user.role,
      responseTime: `${responseTime}ms`,
      ip: req.ip 
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        user: {
          userId: user.id,
          email: user.email,
          role: user.role,
          fullName: user.fullName
        },
      },
      message: "Login successful"
    });
  } catch (error) {
    log.error('User login failed', error, { 
      email: email?.toLowerCase(), 
      ip: req.ip,
      responseTime: `${Date.now() - startTime}ms`
    });
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// POST /auth/refresh-token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      res.status(401).json({ message: "Refresh token not provided." });
      return;
    }

    // Find user with this refresh token
    const user = await prisma.user.findFirst({
      where: {
        refreshTokens: {
          has: refreshToken
        }
      }
    });

    if (!user) {
      res.status(401).json({ message: "Invalid refresh token." });
      return;
    }

    // Generate new access token
    const newAccessToken = SecretCodeService.generateSessionCode(user.id, user.email, user.role);
    const newRefreshToken = SecretCodeService.generateSessionCode(user.id, user.email, user.role);

    // Set new access token cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.status(200).json({
      message: "Token refreshed successfully",
      success: true,
      data: {
        accessToken: newAccessToken,
        user: {
          userId: user.id,
          email: user.email,
          role: user.role,
          fullName: user.fullName
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// POST /auth/logout
export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      // Remove refresh token from database
      await prisma.user.update({
        where: { id: req.user.userId },
        data: {
          refreshTokens: {
            set: []
          }
        }
      });
    }

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};