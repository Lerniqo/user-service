import { Request } from 'express';

// Import Prisma types
export type { User, UserRole } from '@prisma/client';

// User interface (keeping for backward compatibility)
export interface IUser {
  id: string;
  email: string;
  role: 'Student' | 'Teacher' | 'Admin';
  fullName: string;
  gradeLevel?: number;
  learningGoals?: string;
  qualifications?: string;
  experienceSummary?: string;
  isActive: boolean;
  isVerified: boolean;
  profileImage?: string;
  verificationCode?: string;
  passwordResetCode?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Request types
export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: 'Student' | 'Teacher' | 'Admin';
  };
}

// Step 1 Registration types (Basic info only)
export interface BasicRegistrationData {
  email: string;
  password: string;
  role: 'Student' | 'Teacher' | 'Admin';
}

// Step 2 Profile completion types (After email verification)
export interface CompleteStudentProfileData {
  fullName: string;                    // Required
  school?: string;                     // Optional
  birthday: string;                    // Required (ISO date format)
  gradeLevel: number;                  // Required (1-12)
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say'; // Required
  learningGoals?: string;              // Optional
  parentGuardianName?: string;         // Optional
  relationship?: string;               // Optional
  parentContact?: string;              // Optional (phone or email)
  addressCity?: string;               // Optional
}

export interface CompleteTeacherProfileData {
  fullName: string;                    // Required
  birthday: string;                    // Required (ISO date format)
  address: string;                     // Required
  phoneNumber: string;                 // Required
  nationalIdPassport: string;          // Required
  yearsOfExperience: number;           // Required (0-50)
  highestEducationLevel: string;       // Required
  qualifications?: string;             // Optional
  shortBio?: string;                   // Optional (teaching philosophy)
}

export interface CompleteAdminProfileData {
  fullName: string;
  department?: string;
}

export type CompleteProfileData = CompleteStudentProfileData | CompleteTeacherProfileData | CompleteAdminProfileData;

// Legacy types for backward compatibility
export interface RegisterStudentData {
  email: string;
  password: string;
  role: 'Student';
  fullName: string;
  gradeLevel: number;
}

export interface RegisterTeacherData {
  email: string;
  password: string;
  role: 'Teacher';
  fullName: string;
  qualifications: string;
}

export type RegisterData = RegisterStudentData | RegisterTeacherData;

// Login types
export interface LoginData {
  email: string;
  password: string;
}

// Profile update types
export interface UpdateProfileData {
  fullName?: string;
  // Student fields
  school?: string;
  gradeLevel?: number;
  gender?: string;
  learningGoals?: string;
  parentGuardianName?: string;
  relationship?: string;
  parentContact?: string;
  addressCity?: string;
  // Teacher fields
  address?: string;
  phoneNumber?: string;
  nationalIdPassport?: string;
  yearsOfExperience?: number;
  highestEducationLevel?: string;
  qualifications?: string;
  shortBio?: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export interface VerifyEmailData {
  code: string;
}

// Response types
export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  error?: string;
}

export interface BasicRegistrationResponse {
  userId: string;
  email: string;
  role: 'Student' | 'Teacher' | 'Admin';
  message: string;
}

export interface EmailVerificationResponse {
  message: string;
  userId: string;
  role: 'Student' | 'Teacher' | 'Admin';
  profileCompleted: boolean;
}

export interface CompleteProfileResponse {
  message: string;
  userId: string;
  email: string;
  role: 'Student' | 'Teacher' | 'Admin';
  fullName: string;
}

export interface LoginResponse {
  message: string;
  userId: string;
  email: string;
  role: 'Student' | 'Teacher' | 'Admin';
  fullName: string;
}

export interface UserProfileResponse {
  userId: string;
  email: string;
  role: 'Student' | 'Teacher' | 'Admin';
  fullName: string;
  // Student fields
  school?: string;
  birthday?: Date;
  gradeLevel?: number;
  gender?: string;
  learningGoals?: string;
  parentGuardianName?: string;
  relationship?: string;
  parentContact?: string;
  addressCity?: string;
  // Teacher fields
  address?: string;
  phoneNumber?: string;
  nationalIdPassport?: string;
  yearsOfExperience?: number;
  highestEducationLevel?: string;
  qualifications?: string;
  shortBio?: string;
  // Common fields
  profileImage?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherPublicProfile {
  userId: string;
  fullName: string;
  qualifications?: string;
  shortBio?: string;
  yearsOfExperience: number;
  reviewStats?: TeacherReviewStats;
  recentReviews?: TeacherReviewResponse[];
}

export interface SystemStatistics {
  totalStudents: number;
  totalTeachers: number;
  totalAdmins: number;
  totalUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  verificationRate: string;
}

// Admin-specific types
export interface UpdateAdminAdministrativeData {
  fullName?: string;
}

// Student profile types for the new schema
export interface UpdateStudentAcademicData {
  gradeLevel?: number;
  learningGoals?: string;
}

// Teacher profile types for the new schema
export interface UpdateTeacherProfessionalData {
  qualifications?: string;
  experienceSummary?: string;
}

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

// Enhanced validation types
export interface StudentValidationData {
  fullName: string;
  school?: string;
  birthday: string;
  gradeLevel: number;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  learningGoals?: string;
  parentGuardianName?: string;
  relationship?: string;
  parentContact?: string;
  addressCity?: string;
}

export interface TeacherValidationData {
  fullName: string;
  birthday: string;
  address: string;
  phoneNumber: string;
  nationalIdPassport: string;
  yearsOfExperience: number;
  highestEducationLevel: string;
  qualifications?: string;
  shortBio?: string;
}

// Teacher Review Types
export interface CreateTeacherReviewData {
  rating: number; // 1-5
  comment?: string;
  isAnonymous?: boolean;
}

export interface UpdateTeacherReviewData {
  rating?: number; // 1-5
  comment?: string;
  isAnonymous?: boolean;
}

export interface TeacherReviewResponse {
  id: string;
  teacherId: string;
  studentId: string;
  rating: number;
  comment?: string;
  isAnonymous: boolean;
  studentName?: string; // Only if not anonymous
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface TeacherProfileWithReviews extends UserProfileResponse {
  reviewStats?: TeacherReviewStats;
  recentReviews?: TeacherReviewResponse[];
}