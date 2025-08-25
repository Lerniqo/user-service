"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProfilePhoto = exports.changePassword = exports.updateUserById = exports.getAllUsers = exports.getStudentById = exports.getTeacherById = exports.getAllTeachers = exports.deleteMyAccount = exports.updateMyProfile = exports.getMyProfile = exports.logout = exports.refreshToken = exports.login = exports.completeProfile = exports.verifyEmail = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const express_validator_1 = require("express-validator");
const prisma_1 = __importDefault(require("../../config/prisma"));
const email_service_1 = require("../../services/email.service");
const secretCode_service_1 = require("../../services/secretCode.service");
const crypto_1 = __importDefault(require("crypto"));
const register = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const { email, password, role = "Student" } = req.body;
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            res.status(400).json({ message: "User with this email already exists." });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const verificationCode = secretCode_service_1.SecretCodeService.generateVerificationCode();
        const user = await prisma_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                role: role,
                fullName: "",
                verificationCode,
                isVerified: false,
            },
        });
        await (0, email_service_1.sendVerificationEmail)(user.email, verificationCode);
        res.status(201).json({
            userId: user.id,
            email: user.email,
            role: user.role,
            message: "Registration successful! Please check your email to verify your account before completing your profile."
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.register = register;
const verifyEmail = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            res.status(400).json({ message: "Verification code is required." });
            return;
        }
        const user = await prisma_1.default.user.findFirst({
            where: { verificationCode: code },
        });
        if (!user) {
            res.status(400).json({ message: "Invalid or expired verification code." });
            return;
        }
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationCode: null,
            },
        });
        res.status(200).json({
            message: "Email verified successfully! Please complete your profile to continue.",
            userId: user.id,
            role: user.role,
            profileCompleted: user.fullName !== ""
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.verifyEmail = verifyEmail;
const completeProfile = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const { userId } = req.params;
        const { fullName, gradeLevel, learningGoals, qualifications, experienceSummary, department } = req.body;
        const user = await prisma_1.default.user.findUnique({
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
        const result = await prisma_1.default.$transaction(async (tx) => {
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: {
                    fullName,
                },
            });
            if (user.role === "Student") {
                await tx.student.create({
                    data: {
                        userId: user.id,
                        gradeLevel: gradeLevel || null,
                        learningGoals: learningGoals || null,
                    },
                });
            }
            else if (user.role === "Teacher") {
                await tx.teacher.create({
                    data: {
                        userId: user.id,
                        qualifications: qualifications || null,
                        experienceSummary: experienceSummary || null,
                    },
                });
            }
            else if (user.role === "Admin") {
                await tx.admin.create({
                    data: {
                        userId: user.id,
                        department: department || null,
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.completeProfile = completeProfile;
const login = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const { email, password } = req.body;
        const user = await prisma_1.default.user.findUnique({
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
        if (user.fullName === "") {
            res.status(401).json({
                message: "Profile not completed. Please complete your profile first.",
                userId: user.id,
                profileCompleted: false
            });
            return;
        }
        const isPasswordCorrect = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordCorrect) {
            res.status(401).json({ message: "Invalid credentials." });
            return;
        }
        const accessToken = secretCode_service_1.SecretCodeService.generateSessionCode(user.id, user.email, user.role);
        const refreshToken = crypto_1.default.randomBytes(32).toString('hex');
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                refreshTokens: {
                    push: refreshToken
                }
            }
        });
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            message: "Login successful"
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.login = login;
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            res.status(401).json({ message: "Refresh token not provided." });
            return;
        }
        const user = await prisma_1.default.user.findFirst({
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
        const newAccessToken = secretCode_service_1.SecretCodeService.generateSessionCode(user.id, user.email, user.role);
        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
        });
        res.status(200).json({
            message: "Token refreshed successfully"
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.refreshToken = refreshToken;
const logout = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        if (refreshToken) {
            await prisma_1.default.user.update({
                where: { id: req.user.userId },
                data: {
                    refreshTokens: {
                        set: []
                    }
                }
            });
        }
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.status(200).json({ message: "Logout successful" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.logout = logout;
const getMyProfile = async (req, res) => {
    try {
        const { userId } = req.user;
        const user = await prisma_1.default.user.findUnique({
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
        let profileData = {
            userId: user.id,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
            isVerified: user.isVerified,
            profileImage: user.profileImage,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
        if (user.role === 'Student' && user.student) {
            profileData.gradeLevel = user.student.gradeLevel;
            profileData.learningGoals = user.student.learningGoals;
        }
        else if (user.role === 'Teacher' && user.teacher) {
            profileData.qualifications = user.teacher.qualifications;
            profileData.experienceSummary = user.teacher.experienceSummary;
        }
        else if (user.role === 'Admin' && user.admin) {
            profileData.department = user.admin.department;
        }
        res.status(200).json(profileData);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.getMyProfile = getMyProfile;
const updateMyProfile = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const updateData = req.body;
        await prisma_1.default.$transaction(async (tx) => {
            const commonFields = {};
            if (updateData.fullName)
                commonFields.fullName = updateData.fullName;
            if (Object.keys(commonFields).length > 0) {
                await tx.user.update({
                    where: { id: userId },
                    data: commonFields,
                });
            }
            if (role === 'Student') {
                const studentFields = {};
                if (updateData.gradeLevel !== undefined)
                    studentFields.gradeLevel = updateData.gradeLevel;
                if (updateData.learningGoals !== undefined)
                    studentFields.learningGoals = updateData.learningGoals;
                if (Object.keys(studentFields).length > 0) {
                    await tx.student.update({
                        where: { userId },
                        data: studentFields,
                    });
                }
            }
            else if (role === 'Teacher') {
                const teacherFields = {};
                if (updateData.qualifications !== undefined)
                    teacherFields.qualifications = updateData.qualifications;
                if (updateData.experienceSummary !== undefined)
                    teacherFields.experienceSummary = updateData.experienceSummary;
                if (Object.keys(teacherFields).length > 0) {
                    await tx.teacher.update({
                        where: { userId },
                        data: teacherFields,
                    });
                }
            }
            else if (role === 'Admin') {
                const adminFields = {};
                if (updateData.department !== undefined)
                    adminFields.department = updateData.department;
                if (Object.keys(adminFields).length > 0) {
                    await tx.admin.update({
                        where: { userId },
                        data: adminFields,
                    });
                }
            }
        });
        const updatedUser = await prisma_1.default.user.findUnique({
            where: { id: userId },
            include: {
                student: true,
                teacher: true,
                admin: true,
            },
        });
        let profileData = {
            userId: updatedUser.id,
            email: updatedUser.email,
            role: updatedUser.role,
            fullName: updatedUser.fullName,
            isVerified: updatedUser.isVerified,
            profileImage: updatedUser.profileImage,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
        };
        if (updatedUser.role === 'Student' && updatedUser.student) {
            profileData.gradeLevel = updatedUser.student.gradeLevel;
            profileData.learningGoals = updatedUser.student.learningGoals;
        }
        else if (updatedUser.role === 'Teacher' && updatedUser.teacher) {
            profileData.qualifications = updatedUser.teacher.qualifications;
            profileData.experienceSummary = updatedUser.teacher.experienceSummary;
        }
        else if (updatedUser.role === 'Admin' && updatedUser.admin) {
            profileData.department = updatedUser.admin.department;
        }
        res.status(200).json(profileData);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating profile" });
    }
};
exports.updateMyProfile = updateMyProfile;
const deleteMyAccount = async (req, res) => {
    try {
        const { userId } = req.user;
        await prisma_1.default.user.delete({
            where: { id: userId },
        });
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.status(204).send();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting account" });
    }
};
exports.deleteMyAccount = deleteMyAccount;
const getAllTeachers = async (req, res) => {
    try {
        const teachers = await prisma_1.default.user.findMany({
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
            experienceSummary: teacher.teacher?.experienceSummary || '',
            profileImage: teacher.profileImage,
        }));
        res.status(200).json(formattedTeachers);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error retrieving teachers" });
    }
};
exports.getAllTeachers = getAllTeachers;
const getTeacherById = async (req, res) => {
    try {
        const { id } = req.params;
        const teacher = await prisma_1.default.user.findUnique({
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
            experienceSummary: teacher.teacher?.experienceSummary || '',
            profileImage: teacher.profileImage,
            createdAt: teacher.createdAt,
        };
        res.status(200).json(formattedTeacher);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error retrieving teacher" });
    }
};
exports.getTeacherById = getTeacherById;
const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await prisma_1.default.user.findUnique({
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
            createdAt: student.createdAt,
        };
        res.status(200).json(formattedStudent);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error retrieving student" });
    }
};
exports.getStudentById = getStudentById;
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma_1.default.user.findMany({
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
            let userData = {
                userId: user.id,
                email: user.email,
                role: user.role,
                fullName: user.fullName,
                isVerified: user.isVerified,
                profileImage: user.profileImage,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            };
            if (user.role === 'Student' && user.student) {
                userData.gradeLevel = user.student.gradeLevel;
                userData.learningGoals = user.student.learningGoals;
            }
            else if (user.role === 'Teacher' && user.teacher) {
                userData.qualifications = user.teacher.qualifications;
                userData.experienceSummary = user.teacher.experienceSummary;
            }
            else if (user.role === 'Admin' && user.admin) {
                userData.department = user.admin.department;
            }
            return userData;
        });
        res.status(200).json(formattedUsers);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error retrieving users" });
    }
};
exports.getAllUsers = getAllUsers;
const updateUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const user = await prisma_1.default.user.findUnique({
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
        await prisma_1.default.$transaction(async (tx) => {
            const commonFields = {};
            if (updateData.fullName !== undefined)
                commonFields.fullName = updateData.fullName;
            if (updateData.isActive !== undefined)
                commonFields.isActive = updateData.isActive;
            if (updateData.isVerified !== undefined)
                commonFields.isVerified = updateData.isVerified;
            if (Object.keys(commonFields).length > 0) {
                await tx.user.update({
                    where: { id },
                    data: commonFields,
                });
            }
            if (user.role === 'Student' && user.student) {
                const studentFields = {};
                if (updateData.gradeLevel !== undefined)
                    studentFields.gradeLevel = updateData.gradeLevel;
                if (updateData.learningGoals !== undefined)
                    studentFields.learningGoals = updateData.learningGoals;
                if (Object.keys(studentFields).length > 0) {
                    await tx.student.update({
                        where: { userId: id },
                        data: studentFields,
                    });
                }
            }
            else if (user.role === 'Teacher' && user.teacher) {
                const teacherFields = {};
                if (updateData.qualifications !== undefined)
                    teacherFields.qualifications = updateData.qualifications;
                if (updateData.experienceSummary !== undefined)
                    teacherFields.experienceSummary = updateData.experienceSummary;
                if (Object.keys(teacherFields).length > 0) {
                    await tx.teacher.update({
                        where: { userId: id },
                        data: teacherFields,
                    });
                }
            }
            else if (user.role === 'Admin' && user.admin) {
                const adminFields = {};
                if (updateData.department !== undefined)
                    adminFields.department = updateData.department;
                if (Object.keys(adminFields).length > 0) {
                    await tx.admin.update({
                        where: { userId: id },
                        data: adminFields,
                    });
                }
            }
        });
        const updatedUser = await prisma_1.default.user.findUnique({
            where: { id },
            include: {
                student: true,
                teacher: true,
                admin: true,
            },
        });
        let userData = {
            userId: updatedUser.id,
            email: updatedUser.email,
            role: updatedUser.role,
            fullName: updatedUser.fullName,
            isVerified: updatedUser.isVerified,
            isActive: updatedUser.isActive,
            profileImage: updatedUser.profileImage,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
        };
        if (updatedUser.role === 'Student' && updatedUser.student) {
            userData.gradeLevel = updatedUser.student.gradeLevel;
            userData.learningGoals = updatedUser.student.learningGoals;
        }
        else if (updatedUser.role === 'Teacher' && updatedUser.teacher) {
            userData.qualifications = updatedUser.teacher.qualifications;
            userData.experienceSummary = updatedUser.teacher.experienceSummary;
        }
        else if (updatedUser.role === 'Admin' && updatedUser.admin) {
            userData.department = updatedUser.admin.department;
        }
        res.status(200).json(userData);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating user" });
    }
};
exports.updateUserById = updateUserById;
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const { userId } = req.user;
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(oldPassword, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Old password incorrect' });
            return;
        }
        const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, 12);
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword },
        });
        res.status(200).json({ message: 'Password changed successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not change password' });
    }
};
exports.changePassword = changePassword;
const uploadProfilePhoto = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }
        const imagePath = `/uploads/${req.file.filename}`;
        const { userId } = req.user;
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { profileImage: imagePath },
        });
        res.status(200).json({
            message: 'Photo uploaded successfully',
            path: imagePath
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Upload failed' });
    }
};
exports.uploadProfilePhoto = uploadProfilePhoto;
//# sourceMappingURL=users.controller.js.map