import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { validationResult } from "express-validator";
import prisma from "../../config/prisma";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../../services/email.service";
import {
  RegisterData,
  LoginData,
  VerifyEmailData,
  LoginResponse,
  ProfileResponse,
  AuthenticatedRequest,
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
      firstName,
      lastName,
      email,
      password,
      role = "STUDENT",
      ...roleSpecificData
    }: any = req.body;

    // Check if email exists in any of the tables
    const existingStudent = await prisma.student.findUnique({
      where: { email },
    });
    const existingTeacher = await prisma.teacher.findUnique({
      where: { email },
    });
    const existingAdmin = await prisma.admin.findUnique({ where: { email } });

    if (existingStudent || existingTeacher || existingAdmin) {
      res.status(400).json({ message: "User with this email already exists." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    let user: any;
    const userData = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      verificationToken,
    };

    // Create user based on role
    if (role === "STUDENT") {
      user = await prisma.student.create({
        data: {
          ...userData,
          studentId: `STU${Date.now()}`,
          department: roleSpecificData.department || null,
          yearOfStudy: roleSpecificData.yearOfStudy || null,
          semester: roleSpecificData.semester || null,
        },
      });
    } else if (role === "TEACHER") {
      user = await prisma.teacher.create({
        data: {
          ...userData,
          teacherId: `TCH${Date.now()}`,
          department: roleSpecificData.department || null,
          designation: roleSpecificData.designation || null,
          qualification: roleSpecificData.qualification || null,
          specialization: roleSpecificData.specialization || null,
          experience: roleSpecificData.experience || null,
        },
      });
    } else if (role === "ADMIN") {
      user = await prisma.admin.create({
        data: {
          ...userData,
          adminId: `ADM${Date.now()}`,
          department: roleSpecificData.department || null,
          designation: roleSpecificData.designation || null,
          permissions: roleSpecificData.permissions || [],
        },
      });
    } else {
      res.status(400).json({ message: "Invalid role specified." });
      return;
    }

    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      message:
        "Registration successful! Please check your email to verify your account.",
      user: {
        id: user.id,
        email: user.email,
        role: role,
        firstName: user.firstName,
        lastName: user.lastName,
        ...(user.studentId && { studentId: user.studentId }),
        ...(user.teacherId && { teacherId: user.teacherId }),
        ...(user.adminId && { adminId: user.adminId }),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Verify user email
// @route   POST /api/auth/verify-email
export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token }: VerifyEmailData = req.body;
    if (!token) {
      res.status(400).json({ message: "Token is required." });
      return;
    }

    // Check in all tables for the verification token
    let user: any = await prisma.student.findUnique({
      where: { verificationToken: token },
    });

    if (!user) {
      user = await prisma.teacher.findUnique({
        where: { verificationToken: token },
      });
    }

    if (!user) {
      user = await prisma.admin.findUnique({
        where: { verificationToken: token },
      });
    }

    if (!user) {
      res
        .status(400)
        .json({ message: "Invalid or expired verification token." });
      return;
    }

    // Update the appropriate table
    if (user.studentId) {
      await prisma.student.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          verificationToken: null,
        },
      });
    } else if (user.teacherId) {
      await prisma.teacher.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          verificationToken: null,
        },
      });
    } else if (user.adminId) {
      await prisma.admin.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          verificationToken: null,
        },
      });
    }

    res
      .status(200)
      .json({ message: "Email verified successfully! You can now log in." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Login a user
// @route   POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { email, password }: LoginData = req.body;

    // Check in all tables for the user
    let user: any = await prisma.student.findUnique({ where: { email } });
    let role: "STUDENT" | "TEACHER" | "ADMIN" = "STUDENT";

    if (!user) {
      user = await prisma.teacher.findUnique({ where: { email } });
      role = "TEACHER";
    }

    if (!user) {
      user = await prisma.admin.findUnique({ where: { email } });
      role = "ADMIN";
    }

    if (!user) {
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }

    if (!user.isVerified) {
      res
        .status(401)
        .json({ message: "Email not verified. Please check your inbox." });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: role },
      process.env["JWT_SECRET"]!,
      { expiresIn: "24h" }
    );

    const response: LoginResponse = {
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId, role } = req.user;

    let user: any;
    let profileData: ProfileResponse;

    // Get user from appropriate table based on role
    if (role === "STUDENT") {
      user = await prisma.student.findUnique({
        where: { id: userId },
      });
      if (user) {
        profileData = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: "STUDENT",
          profileImage: user.profileImage || undefined,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          studentInfo: {
            studentId: user.studentId,
            department: user.department || undefined,
            yearOfStudy: user.yearOfStudy || undefined,
            semester: user.semester || undefined,
            enrollmentDate: user.enrollmentDate,
            graduationDate: user.graduationDate || undefined,
            gpa: user.gpa || undefined,
            isActive: user.isActive,
          },
        };
      }
    } else if (role === "TEACHER") {
      user = await prisma.teacher.findUnique({
        where: { id: userId },
      });
      if (user) {
        profileData = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: "TEACHER",
          profileImage: user.profileImage || undefined,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          teacherInfo: {
            teacherId: user.teacherId,
            department: user.department || undefined,
            designation: user.designation || undefined,
            qualification: user.qualification || undefined,
            specialization: user.specialization || undefined,
            joiningDate: user.joiningDate,
            experience: user.experience || undefined,
            isActive: user.isActive,
          },
        };
      }
    } else if (role === "ADMIN") {
      user = await prisma.admin.findUnique({
        where: { id: userId },
      });
      if (user) {
        profileData = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: "ADMIN",
          profileImage: user.profileImage || undefined,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          adminInfo: {
            adminId: user.adminId,
            department: user.department || undefined,
            designation: user.designation || undefined,
            permissions: user.permissions,
            joiningDate: user.joiningDate,
            isActive: user.isActive,
          },
        };
      }
    }

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    res.status(200).json(profileData!);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// -------------------- PASSWORD RESET FLOW --------------------

// @desc    Request password reset email
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ message: "Email is required." });
    return;
  }

  try {
    // Find user in any table
    let user: any = await prisma.student.findUnique({ where: { email } });
    let userRole: "STUDENT" | "TEACHER" | "ADMIN" | null = "STUDENT";

    if (!user) {
      user = await prisma.teacher.findUnique({ where: { email } });
      userRole = "TEACHER";
    }
    if (!user) {
      user = await prisma.admin.findUnique({ where: { email } });
      userRole = "ADMIN";
    }
    if (!user) {
      // For security, don't reveal if email doesn't exist
      res
        .status(200)
        .json({
          message: "If the email exists, a password reset link has been sent.",
        });
      return;
    }

    // Generate reset token and expiry (e.g., 1 hour)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600 * 1000); // 1 hour from now

    // Update user with reset token and expiry
    if (userRole === "STUDENT") {
      await prisma.student.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpires: resetTokenExpiry,
        },
      });
    } else if (userRole === "TEACHER") {
      await prisma.teacher.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpires: resetTokenExpiry,
        },
      });
    } else if (userRole === "ADMIN") {
      await prisma.admin.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpires: resetTokenExpiry,
        },
      });
    }

    // Send password reset email
    await sendPasswordResetEmail(email, resetToken);

    res
      .status(200)
      .json({
        message: "If the email exists, a password reset link has been sent.",
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    res.status(400).json({ message: "Token and new password are required." });
    return;
  }

  try {
    // Find user by reset token and check expiry
    let user: any = await prisma.student.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gt: new Date() }, // expiry in future
      },
    });
    let userRole: "STUDENT" | "TEACHER" | "ADMIN" | null = "STUDENT";

    if (!user) {
      user = await prisma.teacher.findFirst({
        where: {
          passwordResetToken: token,
          passwordResetExpires: { gt: new Date() },
        },
      });
      userRole = "TEACHER";
    }
    if (!user) {
      user = await prisma.admin.findFirst({
        where: {
          passwordResetToken: token,
          passwordResetExpires: { gt: new Date() },
        },
      });
      userRole = "ADMIN";
    }

    if (!user) {
      res
        .status(400)
        .json({ message: "Invalid or expired password reset token." });
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user's password and clear reset token fields
    if (userRole === "STUDENT") {
      await prisma.student.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          passwordResetToken: null,
        },
      });
    } else if (userRole === "TEACHER") {
      await prisma.teacher.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
        },
      });
    } else if (userRole === "ADMIN") {
      await prisma.admin.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });
    }

    res
      .status(200)
      .json({
        message: "Password has been reset successfully. You can now log in.",
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
