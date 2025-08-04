import { Request } from 'express';

// User types
export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  isVerified: boolean;
  verificationToken?: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudent extends IUser {
  studentId: string;
  department?: string;
  yearOfStudy?: number;
  semester?: number;
  enrollmentDate: Date;
  graduationDate?: Date;
  gpa?: number;
  isActive: boolean;
}

export interface ITeacher extends IUser {
  teacherId: string;
  department?: string;
  designation?: string;
  qualification?: string;
  specialization?: string;
  joiningDate: Date;
  experience?: number;
  isActive: boolean;
}

export interface IAdmin extends IUser {
  adminId: string;
  department?: string;
  designation?: string;
  permissions: string[];
  joiningDate: Date;
  isActive: boolean;
}

// Request types
export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  };
}

// Registration types
export interface RegisterStudentData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'STUDENT';
  department?: string;
  yearOfStudy?: number;
  semester?: number;
}

export interface RegisterTeacherData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'TEACHER';
  department?: string;
  designation?: string;
  qualification?: string;
  specialization?: string;
  experience?: number;
}

export interface RegisterAdminData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'ADMIN';
  department?: string;
  designation?: string;
  permissions?: string[];
}

export type RegisterData = RegisterStudentData | RegisterTeacherData | RegisterAdminData;

// Login types
export interface LoginData {
  email: string;
  password: string;
}

// Profile update types
export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface UpdateStudentAcademicData {
  department?: string;
  yearOfStudy?: number;
  semester?: number;
  gpa?: number;
}

export interface UpdateTeacherProfessionalData {
  department?: string;
  designation?: string;
  qualification?: string;
  specialization?: string;
  experience?: number;
}

export interface UpdateAdminAdministrativeData {
  department?: string;
  designation?: string;
  permissions?: string[];
}

// Password change types
export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

// Email verification types
export interface VerifyEmailData {
  token: string;
}

// Response types
export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  error?: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    role: 'STUDENT' | 'TEACHER' | 'ADMIN';
    firstName: string;
    lastName: string;
  };
}

export interface ProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  profileImage?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  studentInfo?: {
    studentId: string;
    department?: string;
    yearOfStudy?: number;
    semester?: number;
    enrollmentDate: Date;
    graduationDate?: Date;
    gpa?: number;
    isActive: boolean;
  };
  teacherInfo?: {
    teacherId: string;
    department?: string;
    designation?: string;
    qualification?: string;
    specialization?: string;
    joiningDate: Date;
    experience?: number;
    isActive: boolean;
  };
  adminInfo?: {
    adminId: string;
    department?: string;
    designation?: string;
    permissions: string[];
    joiningDate: Date;
    isActive: boolean;
  };
}

// Statistics types
export interface SystemStatistics {
  totalStudents: number;
  totalTeachers: number;
  totalAdmins: number;
  totalUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  verificationRate: string;
}

// File upload types
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