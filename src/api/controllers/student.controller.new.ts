import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { AuthenticatedRequest, UpdateStudentAcademicData } from '../../types';

// @desc Get student profile
// @route GET /api/student/profile
export const getStudentProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.user.findUnique({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving student profile' });
  }
};

// @desc Update student academic details
// @route PUT /api/student/update-academic
export const updateAcademicDetails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { gradeLevel, learningGoals }: UpdateStudentAcademicData = req.body;

    const updatedStudent = await prisma.user.update({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating academic details' });
  }
};

// @desc Get all students
// @route GET /api/student/all
export const getAllStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const students = await prisma.user.findMany({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving students' });
  }
};

// @desc Get students by grade level
// @route GET /api/student/grade/:gradeLevel
export const getStudentsByGradeLevel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gradeLevel } = req.params;

    const students = await prisma.user.findMany({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving students by grade level' });
  }
};
