"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentsByGradeLevel = exports.getAllStudents = exports.updateAcademicDetails = exports.getStudentProfile = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const getStudentProfile = async (req, res) => {
    try {
        const student = await prisma_1.default.user.findUnique({
            where: {
                id: req.user.userId,
                role: 'Student'
            },
        });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found' });
            return;
        }
        res.status(200).json({
            message: 'Student profile retrieved successfully',
            student: {
                id: student.id,
                email: student.email,
                fullName: student.fullName,
                role: student.role,
                gradeLevel: student.gradeLevel,
                learningGoals: student.learningGoals,
                isActive: student.isActive,
                isVerified: student.isVerified,
                profileImage: student.profileImage,
                createdAt: student.createdAt,
                updatedAt: student.updatedAt,
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving student profile' });
    }
};
exports.getStudentProfile = getStudentProfile;
const updateAcademicDetails = async (req, res) => {
    try {
        const { gradeLevel, learningGoals } = req.body;
        const updatedStudent = await prisma_1.default.user.update({
            where: {
                id: req.user.userId,
                role: 'Student'
            },
            data: {
                gradeLevel,
                learningGoals,
            },
        });
        res.status(200).json({
            message: 'Academic details updated successfully',
            student: updatedStudent
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating academic details' });
    }
};
exports.updateAcademicDetails = updateAcademicDetails;
const getAllStudents = async (req, res) => {
    try {
        const students = await prisma_1.default.user.findMany({
            where: {
                role: 'Student',
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
                isActive: true,
                createdAt: true,
            }
        });
        res.status(200).json({
            message: 'Students retrieved successfully',
            count: students.length,
            students
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving students' });
    }
};
exports.getAllStudents = getAllStudents;
const getStudentsByGradeLevel = async (req, res) => {
    try {
        const { gradeLevel } = req.params;
        const students = await prisma_1.default.user.findMany({
            where: {
                role: 'Student',
                gradeLevel: parseInt(gradeLevel),
                isActive: true
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                profileImage: true,
                role: true,
                gradeLevel: true,
                learningGoals: true,
                isActive: true,
            }
        });
        res.status(200).json({
            message: `Students in grade ${gradeLevel} retrieved successfully`,
            count: students.length,
            students
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving students by grade level' });
    }
};
exports.getStudentsByGradeLevel = getStudentsByGradeLevel;
//# sourceMappingURL=student.controller.js.map