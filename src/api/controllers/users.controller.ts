import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import prisma from '../../config/prisma';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../services/email.service';
import { SecretCodeService } from '../../services/secretCode.service';
import crypto from 'crypto';
import { log } from '../../config/logger';
import {
  AuthenticatedRequest,
  RegisterStudentData,
  RegisterTeacherData,
  UserProfileResponse,
  LoginResponse,
  SystemStatistics,
} from '../../types';

// POST /users/register - Step 1: Basic registration
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

// POST /users/verify-email
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

// POST /users/resend-verification
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

// POST /users/complete-profile - Step 2: Complete profile after verification
export const completeProfile = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { userId } = req.params;
    const requestData = req.body;

    // Find the user and check if verified
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    if (!user.isVerified) {
      res.status(400).json({ message: "Email must be verified before completing profile." });
      return;
    }

    if (user.fullName !== "") {
      res.status(400).json({ message: "Profile already completed." });
      return;
    }

    // Role-specific validation for required fields
    const roleValidationErrors: string[] = [];
    
    if (user.role === "Student") {
      if (!requestData.birthday) roleValidationErrors.push("Birthday is required for students");
      if (!requestData.gradeLevel) roleValidationErrors.push("Grade level is required for students");
      if (!requestData.gender) roleValidationErrors.push("Gender is required for students");
      
      // Age validation for students (5-25 years)
      if (requestData.birthday) {
        const birthDate = new Date(requestData.birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        if (age < 5 || age > 25) {
          roleValidationErrors.push("Student age must be between 5 and 25 years");
        }
      }
    } else if (user.role === "Teacher") {
      if (!requestData.birthday) roleValidationErrors.push("Birthday is required for teachers");
      if (!requestData.address) roleValidationErrors.push("Address is required for teachers");
      if (!requestData.phoneNumber) roleValidationErrors.push("Phone number is required for teachers");
      if (!requestData.nationalIdPassport) roleValidationErrors.push("National ID/Passport is required for teachers");
      if (requestData.yearsOfExperience === undefined || requestData.yearsOfExperience === null) roleValidationErrors.push("Years of experience is required for teachers");
      if (!requestData.highestEducationLevel) roleValidationErrors.push("Highest education level is required for teachers");
      
      // Age validation for teachers (21-80 years)
      if (requestData.birthday) {
        const birthDate = new Date(requestData.birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        if (age < 21 || age > 80) {
          roleValidationErrors.push("Teacher age must be between 21 and 80 years");
        }
      }
    }

    if (roleValidationErrors.length > 0) {
      res.status(400).json({ 
        message: "Validation failed", 
        errors: roleValidationErrors.map(error => ({ msg: error, param: "role_specific" }))
      });
      return;
    }

    // Complete profile with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user with full name
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          fullName: requestData.fullName,
        },
      });

      // Create role-specific profile with comprehensive data
      if (user.role === "Student") {
        await tx.student.create({
          data: {
            userId: user.id,
            school: requestData.school || null,
            birthday: new Date(requestData.birthday),
            gradeLevel: requestData.gradeLevel,
            gender: requestData.gender,
            learningGoals: requestData.learningGoals || null,
            parentGuardianName: requestData.parentGuardianName || null,
            relationship: requestData.relationship || null,
            parentContact: requestData.parentContact || null,
            addressCity: requestData.addressCity || null,
          },
        });
      } else if (user.role === "Teacher") {
        await tx.teacher.create({
          data: {
            userId: user.id,
            birthday: new Date(requestData.birthday),
            address: requestData.address,
            phoneNumber: requestData.phoneNumber,
            nationalIdPassport: requestData.nationalIdPassport,
            yearsOfExperience: requestData.yearsOfExperience,
            highestEducationLevel: requestData.highestEducationLevel,
            qualifications: requestData.qualifications || null,
            shortBio: requestData.shortBio || null,
          },
        });
      } else if (user.role === "Admin") {
        // Maintain backward compatibility for Admin role
        await tx.admin.create({
          data: {
            userId: user.id,
            department: requestData.department || null,
          },
        });
      }

      return updatedUser;
    });

    res.status(200).json({
      message: "Profile completed successfully! You can now log in.",
      userId: result.id,
      email: result.email,
      role: result.role,
      fullName: result.fullName,
    });
  } catch (error) {
    console.error('Complete profile error:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// POST /users/login
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

// POST /users/refresh-token
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

// POST /users/logout
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

// GET /users/me
export const getMyProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.user;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
        teacher: true,
        admin: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    let profileData: any = {
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      isVerified: user.isVerified,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isProfileCompleted: true,
    };

    // Add role-specific data
    if (user.role === 'Student' && user.student) {
      profileData.gradeLevel = user.student.gradeLevel;
      profileData.learningGoals = user.student.learningGoals;
    } else if (user.role === 'Teacher' && user.teacher) {
      profileData.qualifications = user.teacher.qualifications;
      profileData.shortBio = user.teacher.shortBio;
    } else if (user.role === 'Admin' && user.admin) {
      profileData.department = user.admin.department;
    } else {
      profileData.isProfileCompleted = false
    }

    res.status(200).json(profileData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// PUT /users/me
export const updateMyProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId, role } = req.user;
    const updateData = req.body;

    await prisma.$transaction(async (tx) => {
      // Update common user fields
      const commonFields: any = {};
      if (updateData.fullName) commonFields.fullName = updateData.fullName;

      if (Object.keys(commonFields).length > 0) {
        await tx.user.update({
          where: { id: userId },
          data: commonFields,
        });
      }

      // Update role-specific fields
      if (role === 'Student') {
        const studentFields: any = {};
        if (updateData.gradeLevel !== undefined) studentFields.gradeLevel = updateData.gradeLevel;
        if (updateData.learningGoals !== undefined) studentFields.learningGoals = updateData.learningGoals;

        if (Object.keys(studentFields).length > 0) {
          await tx.student.update({
            where: { userId },
            data: studentFields,
          });
        }
      } else if (role === 'Teacher') {
        const teacherFields: any = {};
        if (updateData.qualifications !== undefined) teacherFields.qualifications = updateData.qualifications;
        if (updateData.shortBio !== undefined) teacherFields.shortBio = updateData.shortBio;
        // Backward compatibility: map experienceSummary to shortBio
        if (updateData.experienceSummary !== undefined) teacherFields.shortBio = updateData.experienceSummary;

        if (Object.keys(teacherFields).length > 0) {
          await tx.teacher.update({
            where: { userId },
            data: teacherFields,
          });
        }
      } else if (role === 'Admin') {
        const adminFields: any = {};
        if (updateData.department !== undefined) adminFields.department = updateData.department;

        if (Object.keys(adminFields).length > 0) {
          await tx.admin.update({
            where: { userId },
            data: adminFields,
          });
        }
      }
    });

    // Fetch and return updated profile
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
        teacher: true,
        admin: true,
      },
    });

    let profileData: any = {
      userId: updatedUser!.id,
      email: updatedUser!.email,
      role: updatedUser!.role,
      fullName: updatedUser!.fullName,
      isVerified: updatedUser!.isVerified,
      profileImage: updatedUser!.profileImage,
      createdAt: updatedUser!.createdAt,
      updatedAt: updatedUser!.updatedAt,
    };

    // Add role-specific data
    if (updatedUser!.role === 'Student' && updatedUser!.student) {
      profileData.gradeLevel = updatedUser!.student.gradeLevel;
      profileData.learningGoals = updatedUser!.student.learningGoals;
    } else if (updatedUser!.role === 'Teacher' && updatedUser!.teacher) {
      profileData.qualifications = updatedUser!.teacher.qualifications;
      profileData.shortBio = updatedUser!.teacher.shortBio;
    } else if (updatedUser!.role === 'Admin' && updatedUser!.admin) {
      profileData.department = updatedUser!.admin.department;
    }

    res.status(200).json(profileData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating profile" });
  }
};

// DELETE /users/me
export const deleteMyAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.user;

    await prisma.user.delete({
      where: { id: userId },
    });

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting account" });
  }
};

// GET /users/teachers
export const getAllTeachers = async (req: Request, res: Response): Promise<void> => {
  try {
    const teachers = await prisma.user.findMany({
      where: {
        role: 'Teacher',
        isActive: true,
        isVerified: true,
      },
      include: {
        teacher: true,
      },
    });

    const formattedTeachers = teachers.map(teacher => ({
      userId: teacher.id,
      fullName: teacher.fullName,
      qualifications: teacher.teacher?.qualifications || '',
      shortBio: teacher.teacher?.shortBio || '',
      profileImage: teacher.profileImage,
    }));

    res.status(200).json({
      message: "Successfully retrieved teachers",
      data: {
        teachers: formattedTeachers,
      },
      success: true,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving teachers" });
  }
};

// GET /users/teachers/:id
export const getTeacherById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const teacher = await prisma.user.findUnique({
      where: {
        id,
        role: 'Teacher',
        isActive: true,
        isVerified: true,
      },
      include: {
        teacher: true,
      },
    });

    if (!teacher) {
      res.status(404).json({ message: "Teacher not found" });
      return;
    }

    const formattedTeacher = {
      userId: teacher.id,
      fullName: teacher.fullName,
      email: teacher.email,
      qualifications: teacher.teacher?.qualifications || '',
      shortBio: teacher.teacher?.shortBio || '',
      profileImage: teacher.profileImage,
      isVerified: teacher.isVerified,
      birthday: teacher.teacher?.birthday,
      address: teacher.teacher?.address,
      phoneNumber: teacher.teacher?.phoneNumber,
      nationalIdPassport: teacher.teacher?.nationalIdPassport,
      yearsOfExperience: teacher.teacher?.yearsOfExperience,
      highestEducationLevel: teacher.teacher?.highestEducationLevel,
      createdAt: teacher.createdAt,
    };
    
    res.status(200).json({
      message: "Successfully retrieved teacher",
      data: {
        ...formattedTeacher,
      },
      success: true,
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving teacher" });
  }
};

// GET /users/students/:id (Admin only)
export const getStudentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const student = await prisma.user.findUnique({
      where: {
        id,
        role: 'Student',
        isActive: true,
      },
      include: {
        student: true,
      },
    });

    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    const formattedStudent = {
      userId: student.id,
      fullName: student.fullName,
      email: student.email,
      gradeLevel: student.student?.gradeLevel,
      learningGoals: student.student?.learningGoals || '',
      profileImage: student.profileImage,
      isVerified: student.isVerified,
      birthday: student.student?.birthday,
      school: student.student?.school || '',
      gender: student.student?.gender,
      parentGuardianName: student.student?.parentGuardianName || '',
      relationship: student.student?.relationship || '',
      parentContact: student.student?.parentContact || '',
      addressCity: student.student?.addressCity || '',

      createdAt: student.createdAt,
    };

    res.status(200).json({
      message: "Successfully retrieved student",
      data: {
        ...formattedStudent,
      },
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving student" });
  }
};

// GET /users (Admin only)
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
      },
      include: {
        student: true,
        teacher: true,
        admin: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedUsers = users.map(user => {
      let userData: any = {
        userId: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        isVerified: user.isVerified,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      // Add role-specific data
      if (user.role === 'Student' && user.student) {
        userData.gradeLevel = user.student.gradeLevel;
        userData.learningGoals = user.student.learningGoals;
      } else if (user.role === 'Teacher' && user.teacher) {
        userData.qualifications = user.teacher.qualifications;
        userData.shortBio = user.teacher.shortBio;
      } else if (user.role === 'Admin' && user.admin) {
        userData.department = user.admin.department;
      }

      return userData;
    });

    res.status(200).json({
      message: "Successfully retrieved users",
      data: {
        users: formattedUsers,
      },
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving users" });
  }
};

// PUT /users/:id (Admin only)
export const updateUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        student: true,
        teacher: true,
        admin: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    await prisma.$transaction(async (tx) => {
      // Update common user fields
      const commonFields: any = {};
      if (updateData.fullName !== undefined) commonFields.fullName = updateData.fullName;
      if (updateData.isActive !== undefined) commonFields.isActive = updateData.isActive;
      if (updateData.isVerified !== undefined) commonFields.isVerified = updateData.isVerified;

      if (Object.keys(commonFields).length > 0) {
        await tx.user.update({
          where: { id },
          data: commonFields,
        });
      }

      // Update role-specific fields
      if (user.role === 'Student' && user.student) {
        const studentFields: any = {};
        if (updateData.gradeLevel !== undefined) studentFields.gradeLevel = updateData.gradeLevel;
        if (updateData.learningGoals !== undefined) studentFields.learningGoals = updateData.learningGoals;

        if (Object.keys(studentFields).length > 0) {
          await tx.student.update({
            where: { userId: id },
            data: studentFields,
          });
        }
      } else if (user.role === 'Teacher' && user.teacher) {
        const teacherFields: any = {};
        if (updateData.qualifications !== undefined) teacherFields.qualifications = updateData.qualifications;
        if (updateData.shortBio !== undefined) teacherFields.shortBio = updateData.shortBio;
        // Backward compatibility: map experienceSummary to shortBio
        if (updateData.experienceSummary !== undefined) teacherFields.shortBio = updateData.experienceSummary;

        if (Object.keys(teacherFields).length > 0) {
          await tx.teacher.update({
            where: { userId: id },
            data: teacherFields,
          });
        }
      } else if (user.role === 'Admin' && user.admin) {
        const adminFields: any = {};
        if (updateData.department !== undefined) adminFields.department = updateData.department;

        if (Object.keys(adminFields).length > 0) {
          await tx.admin.update({
            where: { userId: id },
            data: adminFields,
          });
        }
      }
    });

    // Fetch and return updated user
    const updatedUser = await prisma.user.findUnique({
      where: { id },
      include: {
        student: true,
        teacher: true,
        admin: true,
      },
    });

    let userData: any = {
      userId: updatedUser!.id,
      email: updatedUser!.email,
      role: updatedUser!.role,
      fullName: updatedUser!.fullName,
      isVerified: updatedUser!.isVerified,
      isActive: updatedUser!.isActive,
      profileImage: updatedUser!.profileImage,
      createdAt: updatedUser!.createdAt,
      updatedAt: updatedUser!.updatedAt,
    };

    // Add role-specific data
    if (updatedUser!.role === 'Student' && updatedUser!.student) {
      userData.gradeLevel = updatedUser!.student.gradeLevel;
      userData.learningGoals = updatedUser!.student.learningGoals;
    } else if (updatedUser!.role === 'Teacher' && updatedUser!.teacher) {
      userData.qualifications = updatedUser!.teacher.qualifications;
      userData.shortBio = updatedUser!.teacher.shortBio;
    } else if (updatedUser!.role === 'Admin' && updatedUser!.admin) {
      userData.department = updatedUser!.admin.department;
    }

    res.status(200).json({
      message: "Successfully updated user",
      data: {
        user: userData,
      },
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user" });
  }
};

// @desc Change user password  
// @route PUT /user/change-password
export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { oldPassword, newPassword } = req.body;
    const { userId } = req.user;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Old password incorrect' });
      return;
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    res.status(200).json({
      message: 'Password changed successfully',
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not change password' });
  }
};

// @desc Upload profile photo
// @route POST /user/upload-photo  
export const uploadProfilePhoto = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const imagePath = `/uploads/${req.file.filename}`;
    const { userId } = req.user;

    await prisma.user.update({
      where: { id: userId },
      data: { profileImage: imagePath },
    });

    res.status(200).json({
      message: 'Photo uploaded successfully',
      data: {
        profileImage: imagePath,
      },
      success: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed' });
  }
};
