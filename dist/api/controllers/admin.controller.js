"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersByRole = exports.getSystemStatistics = exports.getAllAdmins = exports.updateAdministrativeDetails = exports.getAdminProfile = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const getAdminProfile = async (req, res) => {
    try {
        const admin = await prisma_1.default.admin.findUnique({
            where: { id: req.user.userId },
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
                firstName: admin.firstName,
                lastName: admin.lastName,
                adminId: admin.adminId,
                department: admin.department,
                designation: admin.designation,
                permissions: admin.permissions,
                joiningDate: admin.joiningDate,
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
        const { department, designation, permissions } = req.body;
        const updatedAdmin = await prisma_1.default.admin.update({
            where: { id: req.user.userId },
            data: {
                department,
                designation,
                permissions: permissions || [],
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
        const admins = await prisma_1.default.admin.findMany({
            where: {
                isActive: true
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                profileImage: true,
                isVerified: true,
                adminId: true,
                department: true,
                designation: true,
                permissions: true,
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
            prisma_1.default.student.count({ where: { isActive: true } }),
            prisma_1.default.teacher.count({ where: { isActive: true } }),
            prisma_1.default.admin.count({ where: { isActive: true } }),
            prisma_1.default.student.count({ where: { isVerified: true, isActive: true } }),
            prisma_1.default.teacher.count({ where: { isVerified: true, isActive: true } }),
            prisma_1.default.admin.count({ where: { isVerified: true, isActive: true } }),
            prisma_1.default.student.count({ where: { isVerified: false, isActive: true } }),
            prisma_1.default.teacher.count({ where: { isVerified: false, isActive: true } }),
            prisma_1.default.admin.count({ where: { isVerified: false, isActive: true } })
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
        let users = [];
        if (role === 'STUDENT') {
            users = await prisma_1.default.student.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    profileImage: true,
                    isVerified: true,
                    studentId: true,
                    department: true,
                    yearOfStudy: true,
                    semester: true,
                    gpa: true,
                    isActive: true,
                    createdAt: true,
                }
            });
        }
        else if (role === 'TEACHER') {
            users = await prisma_1.default.teacher.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    profileImage: true,
                    isVerified: true,
                    teacherId: true,
                    department: true,
                    designation: true,
                    qualification: true,
                    specialization: true,
                    experience: true,
                    isActive: true,
                    createdAt: true,
                }
            });
        }
        else if (role === 'ADMIN') {
            users = await prisma_1.default.admin.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    profileImage: true,
                    isVerified: true,
                    adminId: true,
                    department: true,
                    designation: true,
                    permissions: true,
                    isActive: true,
                    createdAt: true,
                }
            });
        }
        else {
            res.status(400).json({ message: 'Invalid role specified' });
            return;
        }
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