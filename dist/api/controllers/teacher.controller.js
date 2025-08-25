"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeachersByQualification = exports.getAllTeachers = exports.updateProfessionalDetails = exports.getTeacherProfile = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const getTeacherProfile = async (req, res) => {
    try {
        const teacher = await prisma_1.default.user.findUnique({
            where: {
                id: req.user.userId,
                role: 'Teacher'
            },
        });
        if (!teacher) {
            res.status(404).json({ message: 'Teacher profile not found' });
            return;
        }
        res.status(200).json({
            message: 'Teacher profile retrieved successfully',
            teacher: {
                id: teacher.id,
                email: teacher.email,
                fullName: teacher.fullName,
                role: teacher.role,
                qualifications: teacher.qualifications,
                experienceSummary: teacher.experienceSummary,
                isActive: teacher.isActive,
                isVerified: teacher.isVerified,
                profileImage: teacher.profileImage,
                createdAt: teacher.createdAt,
                updatedAt: teacher.updatedAt,
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving teacher profile' });
    }
};
exports.getTeacherProfile = getTeacherProfile;
const updateProfessionalDetails = async (req, res) => {
    try {
        const { qualifications, experienceSummary } = req.body;
        const updatedTeacher = await prisma_1.default.user.update({
            where: {
                id: req.user.userId,
                role: 'Teacher'
            },
            data: {
                qualifications,
                experienceSummary,
            },
        });
        res.status(200).json({
            message: 'Professional details updated successfully',
            teacher: updatedTeacher
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating professional details' });
    }
};
exports.updateProfessionalDetails = updateProfessionalDetails;
const getAllTeachers = async (req, res) => {
    try {
        const teachers = await prisma_1.default.user.findMany({
            where: {
                role: 'Teacher',
                isActive: true
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                profileImage: true,
                isVerified: true,
                role: true,
                qualifications: true,
                experienceSummary: true,
                isActive: true,
                createdAt: true,
            }
        });
        res.status(200).json({
            message: 'Teachers retrieved successfully',
            count: teachers.length,
            teachers
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving teachers' });
    }
};
exports.getAllTeachers = getAllTeachers;
const getTeachersByQualification = async (req, res) => {
    try {
        const { qualification } = req.params;
        const teachers = await prisma_1.default.user.findMany({
            where: {
                role: 'Teacher',
                qualifications: {
                    contains: qualification,
                    mode: 'insensitive'
                },
                isActive: true
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                profileImage: true,
                role: true,
                qualifications: true,
                experienceSummary: true,
                isActive: true,
            }
        });
        res.status(200).json({
            message: `Teachers with qualification "${qualification}" retrieved successfully`,
            count: teachers.length,
            teachers
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving teachers by qualification' });
    }
};
exports.getTeachersByQualification = getTeachersByQualification;
//# sourceMappingURL=teacher.controller.js.map