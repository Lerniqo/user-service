"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProfilePhoto = exports.changePassword = exports.updateProfile = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../../config/prisma"));
const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, email } = req.body;
        const { userId, role } = req.user;
        let updatedUser;
        if (role === 'STUDENT') {
            updatedUser = await prisma_1.default.student.update({
                where: { id: userId },
                data: { firstName, lastName, email },
            });
        }
        else if (role === 'TEACHER') {
            updatedUser = await prisma_1.default.teacher.update({
                where: { id: userId },
                data: { firstName, lastName, email },
            });
        }
        else if (role === 'ADMIN') {
            updatedUser = await prisma_1.default.admin.update({
                where: { id: userId },
                data: { firstName, lastName, email },
            });
        }
        res.status(200).json({ message: 'Profile updated', user: updatedUser });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const { userId, role } = req.user;
        let user;
        if (role === 'STUDENT') {
            user = await prisma_1.default.student.findUnique({
                where: { id: userId },
            });
        }
        else if (role === 'TEACHER') {
            user = await prisma_1.default.teacher.findUnique({
                where: { id: userId },
            });
        }
        else if (role === 'ADMIN') {
            user = await prisma_1.default.admin.findUnique({
                where: { id: userId },
            });
        }
        const isMatch = await bcryptjs_1.default.compare(oldPassword, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Old password incorrect' });
            return;
        }
        const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, 12);
        if (role === 'STUDENT') {
            await prisma_1.default.student.update({
                where: { id: userId },
                data: { password: hashedNewPassword },
            });
        }
        else if (role === 'TEACHER') {
            await prisma_1.default.teacher.update({
                where: { id: userId },
                data: { password: hashedNewPassword },
            });
        }
        else if (role === 'ADMIN') {
            await prisma_1.default.admin.update({
                where: { id: userId },
                data: { password: hashedNewPassword },
            });
        }
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
        const { userId, role } = req.user;
        if (role === 'STUDENT') {
            await prisma_1.default.student.update({
                where: { id: userId },
                data: { profileImage: imagePath },
            });
        }
        else if (role === 'TEACHER') {
            await prisma_1.default.teacher.update({
                where: { id: userId },
                data: { profileImage: imagePath },
            });
        }
        else if (role === 'ADMIN') {
            await prisma_1.default.admin.update({
                where: { id: userId },
                data: { profileImage: imagePath },
            });
        }
        res.status(200).json({ message: 'Photo uploaded', path: imagePath });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Upload failed' });
    }
};
exports.uploadProfilePhoto = uploadProfilePhoto;
//# sourceMappingURL=user.controller.js.map