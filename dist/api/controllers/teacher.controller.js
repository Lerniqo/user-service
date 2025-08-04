"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeachersByDesignation = exports.getTeachersByDepartment = exports.getAllTeachers = exports.updateProfessionalDetails = exports.getTeacherProfile = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const getTeacherProfile = async (req, res) => {
    try {
        const teacher = await prisma_1.default.teacher.findUnique({
            where: { id: req.user.userId },
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
                firstName: teacher.firstName,
                lastName: teacher.lastName,
                teacherId: teacher.teacherId,
                department: teacher.department,
                designation: teacher.designation,
                qualification: teacher.qualification,
                specialization: teacher.specialization,
                joiningDate: teacher.joiningDate,
                experience: teacher.experience,
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
        const { department, designation, qualification, specialization, experience } = req.body;
        const updatedTeacher = await prisma_1.default.teacher.update({
            where: { id: req.user.userId },
            data: {
                department,
                designation,
                qualification,
                specialization,
                experience: experience ? parseInt(experience.toString()) : undefined,
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
        const teachers = await prisma_1.default.teacher.findMany({
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
const getTeachersByDepartment = async (req, res) => {
    try {
        const { department } = req.params;
        const teachers = await prisma_1.default.teacher.findMany({
            where: {
                department: department,
                isActive: true
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                profileImage: true,
                teacherId: true,
                department: true,
                designation: true,
                qualification: true,
                specialization: true,
                experience: true,
                isActive: true,
            }
        });
        res.status(200).json({
            message: `Teachers in ${department} department retrieved successfully`,
            count: teachers.length,
            teachers
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving teachers by department' });
    }
};
exports.getTeachersByDepartment = getTeachersByDepartment;
const getTeachersByDesignation = async (req, res) => {
    try {
        const { designation } = req.params;
        const teachers = await prisma_1.default.teacher.findMany({
            where: {
                designation: designation,
                isActive: true
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                profileImage: true,
                teacherId: true,
                department: true,
                designation: true,
                qualification: true,
                specialization: true,
                experience: true,
                isActive: true,
            }
        });
        res.status(200).json({
            message: `${designation}s retrieved successfully`,
            count: teachers.length,
            teachers
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving teachers by designation' });
    }
};
exports.getTeachersByDesignation = getTeachersByDesignation;
//# sourceMappingURL=teacher.controller.js.map