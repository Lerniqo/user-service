"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.logout = exports.getProfile = exports.login = exports.verifyEmail = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const express_validator_1 = require("express-validator");
const prisma_1 = __importDefault(require("../../config/prisma"));
const email_service_1 = require("../../services/email.service");
const secretCode_service_1 = require("../../services/secretCode.service");
const register = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    try {
        const { email, password, role = "Student", firstName, lastName, gradeLevel, qualifications, } = req.body;
        const fullName = `${firstName} ${lastName}`;
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
                fullName,
                gradeLevel: role === "Student" ? gradeLevel : null,
                qualifications: role === "Teacher" ? qualifications : null,
                verificationCode,
            },
        });
        await (0, email_service_1.sendVerificationEmail)(user.email, verificationCode);
        res.status(201).json({
            message: "Registration successful! Please check your email to verify your account.",
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                fullName: user.fullName,
            },
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
            message: "Email verified successfully! You can now log in."
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
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
        const isPasswordCorrect = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordCorrect) {
            res.status(401).json({ message: "Invalid credentials." });
            return;
        }
        const sessionCode = secretCode_service_1.SecretCodeService.generateSessionCode(user.id, user.email, user.role);
        const response = {
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        const { userId } = req.user;
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        const profileData = {
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.getProfile = getProfile;
const logout = async (req, res) => {
    try {
        res.status(200).json({ message: "Logged out successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.logout = logout;
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ message: "Email is required." });
        return;
    }
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { email }
        });
        if (!user) {
            res.status(200).json({
                message: "If the email exists, a password reset link has been sent.",
            });
            return;
        }
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        const resetTokenExpiry = new Date(Date.now() + 3600 * 1000);
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                passwordResetCode: resetToken,
                passwordResetExpires: resetTokenExpiry,
            },
        });
        await (0, email_service_1.sendPasswordResetEmail)(email, resetToken);
        res.status(200).json({
            message: "If the email exists, a password reset link has been sent.",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        res.status(400).json({ message: "Token and new password are required." });
        return;
    }
    try {
        const user = await prisma_1.default.user.findFirst({
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
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
        await prisma_1.default.user.update({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=auth.controller.js.map