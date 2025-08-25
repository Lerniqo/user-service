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
        const { fullName } = req.body;
        const { userId } = req.user;
        const updatedUser = await prisma_1.default.user.update({
            where: { id: userId },
            data: { fullName },
        });
        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                fullName: updatedUser.fullName,
                role: updatedUser.role,
            }
        });
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
//# sourceMappingURL=user.controller.js.map