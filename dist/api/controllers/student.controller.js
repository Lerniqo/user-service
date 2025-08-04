"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentsByDepartment = exports.getAllStudents = exports.updateAcademicDetails = exports.getStudentProfile = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const getStudentProfile = async (req, res) => {
    try {
        const student = await prisma_1.default.student.findUnique({
            where: { id: req.user.userId },
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
                firstName: student.firstName,
                lastName: student.lastName,
                studentId: student.studentId,
                department: student.department,
                yearOfStudy: student.yearOfStudy,
                semester: student.semester,
                enrollmentDate: student.enrollmentDate,
                graduationDate: student.graduationDate,
                gpa: student.gpa,
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
        const { department, yearOfStudy, semester, gpa } = req.body;
        const updatedStudent = await prisma_1.default.student.update({
            where: { id: req.user.userId },
            data: {
                department,
                yearOfStudy: yearOfStudy ? parseInt(yearOfStudy.toString()) : undefined,
                semester: semester ? parseInt(semester.toString()) : undefined,
                gpa: gpa ? parseFloat(gpa.toString()) : undefined,
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
        const students = await prisma_1.default.student.findMany({
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
                studentId: true,
                department: true,
                yearOfStudy: true,
                semester: true,
                gpa: true,
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
const getStudentsByDepartment = async (req, res) => {
    try {
        const { department } = req.params;
        const students = await prisma_1.default.student.findMany({
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
                studentId: true,
                department: true,
                yearOfStudy: true,
                semester: true,
                gpa: true,
                isActive: true,
            }
        });
        res.status(200).json({
            message: `Students in ${department} department retrieved successfully`,
            count: students.length,
            students
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving students by department' });
    }
};
exports.getStudentsByDepartment = getStudentsByDepartment;
//# sourceMappingURL=student.controller.js.map