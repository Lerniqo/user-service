"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersByRole = exports.getSystemStatistics = exports.getAllAdmins = exports.updateAdministrativeDetails = exports.getAdminProfile = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const getAdminProfile = async (req, res) => {
    try {
        const admin = await prisma_1.default.user.findUnique({
            where: {
                id: req.user.userId,
                role: 'Admin'
            },
        });
        if (!admin) {
            res.status(404).json({ message: 'Admin profile not found' });
            return;
        }
        res.status(200).json({
            message: 'Admin profile retrieved successfully',
            admin: {
                id: admin.id,
                email: admin.email,
                fullName: admin.fullName,
                role: admin.role,
                isActive: admin.isActive,
                isVerified: admin.isVerified,
                profileImage: admin.profileImage,
                createdAt: admin.createdAt,
                updatedAt: admin.updatedAt,
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving admin profile' });
    }
};
exports.getAdminProfile = getAdminProfile;
const updateAdministrativeDetails = async (req, res) => {
    try {
        const { fullName } = req.body;
        const updatedAdmin = await prisma_1.default.user.update({
            where: {
                id: req.user.userId,
                role: 'Admin'
            },
            data: {
                fullName,
            },
        });
        res.status(200).json({
            message: 'Administrative details updated successfully',
            admin: updatedAdmin
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating administrative details' });
    }
};
exports.updateAdministrativeDetails = updateAdministrativeDetails;
const getAllAdmins = async (req, res) => {
    try {
        const admins = await prisma_1.default.user.findMany({
            where: {
                role: 'Admin',
                isActive: true
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                profileImage: true,
                isVerified: true,
                role: true,
                isActive: true,
                createdAt: true,
            }
        });
        res.status(200).json({
            message: 'Admins retrieved successfully',
            count: admins.length,
            admins
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving admins' });
    }
};
exports.getAllAdmins = getAllAdmins;
const getSystemStatistics = async (req, res) => {
    try {
        const [totalStudents, totalTeachers, totalAdmins, verifiedStudents, verifiedTeachers, verifiedAdmins, unverifiedStudents, unverifiedTeachers, unverifiedAdmins] = await Promise.all([
            prisma_1.default.user.count({ where: { role: 'Student', isActive: true } }),
            prisma_1.default.user.count({ where: { role: 'Teacher', isActive: true } }),
            prisma_1.default.user.count({ where: { role: 'Admin', isActive: true } }),
            prisma_1.default.user.count({ where: { role: 'Student', isVerified: true, isActive: true } }),
            prisma_1.default.user.count({ where: { role: 'Teacher', isVerified: true, isActive: true } }),
            prisma_1.default.user.count({ where: { role: 'Admin', isVerified: true, isActive: true } }),
            prisma_1.default.user.count({ where: { role: 'Student', isVerified: false, isActive: true } }),
            prisma_1.default.user.count({ where: { role: 'Teacher', isVerified: false, isActive: true } }),
            prisma_1.default.user.count({ where: { role: 'Admin', isVerified: false, isActive: true } })
        ]);
        const totalUsers = totalStudents + totalTeachers + totalAdmins;
        const verifiedUsers = verifiedStudents + verifiedTeachers + verifiedAdmins;
        const unverifiedUsers = unverifiedStudents + unverifiedTeachers + unverifiedAdmins;
        const statistics = {
            totalStudents,
            totalTeachers,
            totalAdmins,
            totalUsers,
            verifiedUsers,
            unverifiedUsers,
            verificationRate: totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(2) : '0.00'
        };
        res.status(200).json({
            message: 'System statistics retrieved successfully',
            statistics
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving system statistics' });
    }
};
exports.getSystemStatistics = getSystemStatistics;
const getUsersByRole = async (req, res) => {
    try {
        const { role } = req.params;
        if (!['Student', 'Teacher', 'Admin'].includes(role)) {
            res.status(400).json({ message: 'Invalid role specified' });
            return;
        }
        const users = await prisma_1.default.user.findMany({
            where: {
                role: role,
                isActive: true
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                profileImage: true,
                isVerified: true,
                role: true,
                gradeLevel: true,
                learningGoals: true,
                qualifications: true,
                experienceSummary: true,
                isActive: true,
                createdAt: true,
            }
        });
        res.status(200).json({
            message: `${role}s retrieved successfully`,
            count: users.length,
            users
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving users by role' });
    }
};
exports.getUsersByRole = getUsersByRole;
//# sourceMappingURL=admin.controller.js.map