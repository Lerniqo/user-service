import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { AuthenticatedRequest, UpdateStudentAcademicData } from '../../types';

// @desc Get student profile with academic details
// @route GET /api/student/profile
export const getStudentProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.student.findUnique({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving student profile' });
  }
};

// @desc Update student academic details
// @route PUT /api/student/update-academic
export const updateAcademicDetails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { department, yearOfStudy, semester, gpa }: UpdateStudentAcademicData = req.body;

    const updatedStudent = await prisma.student.update({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating academic details' });
  }
};

// @desc Get all students (Admin only)
// @route GET /api/student/all
export const getAllStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const students = await prisma.student.findMany({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving students' });
  }
};

// @desc Get students by department
// @route GET /api/student/department/:department
export const getStudentsByDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { department } = req.params;

    const students = await prisma.student.findMany({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving students by department' });
  }
}; 