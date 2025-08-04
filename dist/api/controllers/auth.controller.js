"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = exports.verifyEmail = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const express_validator_1 = require("express-validator");
const prisma_1 = __importDefault(require("../../config/prisma"));
const email_service_1 = require("../../services/email.service");
const register = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const { firstName, lastName, email, password, role = 'STUDENT', ...roleSpecificData } = req.body;
        const existingStudent = await prisma_1.default.student.findUnique({ where: { email } });
        const existingTeacher = await prisma_1.default.teacher.findUnique({ where: { email } });
        const existingAdmin = await prisma_1.default.admin.findUnique({ where: { email } });
        if (existingStudent || existingTeacher || existingAdmin) {
            res.status(400).json({ message: 'User with this email already exists.' });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        let user;
        const userData = {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            verificationToken,
        };
        if (role === 'STUDENT') {
            user = await prisma_1.default.student.create({
                data: {
                    ...userData,
                    studentId: `STU${Date.now()}`,
                    department: roleSpecificData.department || null,
                    yearOfStudy: roleSpecificData.yearOfStudy || null,
                    semester: roleSpecificData.semester || null,
                },
            });
        }
        else if (role === 'TEACHER') {
            user = await prisma_1.default.teacher.create({
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
        }
        else if (role === 'ADMIN') {
            user = await prisma_1.default.admin.create({
                data: {
                    ...userData,
                    adminId: `ADM${Date.now()}`,
                    department: roleSpecificData.department || null,
                    designation: roleSpecificData.designation || null,
                    permissions: roleSpecificData.permissions || [],
                },
            });
        }
        else {
            res.status(400).json({ message: 'Invalid role specified.' });
            return;
        }
        await (0, email_service_1.sendVerificationEmail)(user.email, verificationToken);
        res.status(201).json({
            message: 'Registration successful! Please check your email to verify your account.',
            user: {
                id: user.id,
                email: user.email,
                role: role,
                firstName: user.firstName,
                lastName: user.lastName,
                ...(user.studentId && { studentId: user.studentId }),
                ...(user.teacherId && { teacherId: user.teacherId }),
                ...(user.adminId && { adminId: user.adminId }),
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.register = register;
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(400).json({ message: 'Token is required.' });
            return;
        }
        let user = await prisma_1.default.student.findUnique({
            where: { verificationToken: token },
        });
        if (!user) {
            user = await prisma_1.default.teacher.findUnique({
                where: { verificationToken: token },
            });
        }
        if (!user) {
            user = await prisma_1.default.admin.findUnique({
                where: { verificationToken: token },
            });
        }
        if (!user) {
            res.status(400).json({ message: 'Invalid or expired verification token.' });
            return;
        }
        if (user.studentId) {
            await prisma_1.default.student.update({
                where: { id: user.id },
                data: {
                    isVerified: true,
                    verificationToken: null,
                },
            });
        }
        else if (user.teacherId) {
            await prisma_1.default.teacher.update({
                where: { id: user.id },
                data: {
                    isVerified: true,
                    verificationToken: null,
                },
            });
        }
        else if (user.adminId) {
            await prisma_1.default.admin.update({
                where: { id: user.id },
                data: {
                    isVerified: true,
                    verificationToken: null,
                },
            });
        }
        res.status(200).json({ message: 'Email verified successfully! You can now log in.' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.verifyEmail = verifyEmail;
const login = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const { email, password } = req.body;
        let user = await prisma_1.default.student.findUnique({ where: { email } });
        let role = 'STUDENT';
        if (!user) {
            user = await prisma_1.default.teacher.findUnique({ where: { email } });
            role = 'TEACHER';
        }
        if (!user) {
            user = await prisma_1.default.admin.findUnique({ where: { email } });
            role = 'ADMIN';
        }
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials.' });
            return;
        }
        if (!user.isVerified) {
            res.status(401).json({ message: 'Email not verified. Please check your inbox.' });
            return;
        }
        const isPasswordCorrect = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordCorrect) {
            res.status(401).json({ message: 'Invalid credentials.' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: role }, process.env.JWT_SECRET, { expiresIn: '24h' });
        const response = {
            message: 'Login successful!',
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        const { userId, role } = req.user;
        let user;
        let profileData;
        if (role === 'STUDENT') {
            user = await prisma_1.default.student.findUnique({
                where: { id: userId },
            });
            if (user) {
                profileData = {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: 'STUDENT',
                    profileImage: user.profileImage,
                    isVerified: user.isVerified,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    studentInfo: {
                        studentId: user.studentId,
                        department: user.department,
                        yearOfStudy: user.yearOfStudy,
                        semester: user.semester,
                        enrollmentDate: user.enrollmentDate,
                        graduationDate: user.graduationDate,
                        gpa: user.gpa,
                        isActive: user.isActive,
                    }
                };
            }
        }
        else if (role === 'TEACHER') {
            user = await prisma_1.default.teacher.findUnique({
                where: { id: userId },
            });
            if (user) {
                profileData = {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: 'TEACHER',
                    profileImage: user.profileImage,
                    isVerified: user.isVerified,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    teacherInfo: {
                        teacherId: user.teacherId,
                        department: user.department,
                        designation: user.designation,
                        qualification: user.qualification,
                        specialization: user.specialization,
                        joiningDate: user.joiningDate,
                        experience: user.experience,
                        isActive: user.isActive,
                    }
                };
            }
        }
        else if (role === 'ADMIN') {
            user = await prisma_1.default.admin.findUnique({
                where: { id: userId },
            });
            if (user) {
                profileData = {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: 'ADMIN',
                    profileImage: user.profileImage,
                    isVerified: user.isVerified,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    adminInfo: {
                        adminId: user.adminId,
                        department: user.department,
                        designation: user.designation,
                        permissions: user.permissions,
                        joiningDate: user.joiningDate,
                        isActive: user.isActive,
                    }
                };
            }
        }
        if (!user) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }
        res.status(200).json(profileData);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.getProfile = getProfile;
//# sourceMappingURL=auth.controller.js.map