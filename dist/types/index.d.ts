import { Request } from 'express';
export type { User, UserRole } from '@prisma/client';
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
export interface AuthenticatedRequest extends Request {
    user: {
        userId: string;
        email: string;
        role: 'Student' | 'Teacher' | 'Admin';
    };
}
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
export interface LoginData {
    email: string;
    password: string;
}
export interface UpdateProfileData {
    fullName?: string;
    gradeLevel?: number;
    learningGoals?: string;
    qualifications?: string;
    experienceSummary?: string;
}
export interface ChangePasswordData {
    oldPassword: string;
    newPassword: string;
}
export interface VerifyEmailData {
    code: string;
}
export interface ApiResponse<T = any> {
    message: string;
    data?: T;
    error?: string;
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
    gradeLevel?: number;
    learningGoals?: string;
    qualifications?: string;
    experienceSummary?: string;
    profileImage?: string;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface TeacherPublicProfile {
    userId: string;
    fullName: string;
    qualifications: string;
    experienceSummary: string;
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
export interface UpdateAdminAdministrativeData {
    fullName?: string;
}
export interface UpdateStudentAcademicData {
    gradeLevel?: number;
    learningGoals?: string;
}
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
//# sourceMappingURL=index.d.ts.map