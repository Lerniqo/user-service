import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { AuthenticatedRequest, UpdateTeacherProfessionalData } from '../../types';

// @desc Get teacher profile with professional details
// @route GET /api/teacher/profile
export const getTeacherProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const teacher = await prisma.teacher.findUnique({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving teacher profile' });
  }
};

// @desc Update teacher professional details
// @route PUT /api/teacher/update-professional
export const updateProfessionalDetails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { department, designation, qualification, specialization, experience }: UpdateTeacherProfessionalData = req.body;

    const updatedTeacher = await prisma.teacher.update({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating professional details' });
  }
};

// @desc Get all teachers (Admin only)
// @route GET /api/teacher/all
export const getAllTeachers = async (req: Request, res: Response): Promise<void> => {
  try {
    const teachers = await prisma.teacher.findMany({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving teachers' });
  }
};

// @desc Get teachers by department
// @route GET /api/teacher/department/:department
export const getTeachersByDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { department } = req.params;

    const teachers = await prisma.teacher.findMany({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving teachers by department' });
  }
};

// @desc Get teachers by designation
// @route GET /api/teacher/designation/:designation
export const getTeachersByDesignation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { designation } = req.params;

    const teachers = await prisma.teacher.findMany({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving teachers by designation' });
  }
}; 