import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { AuthenticatedRequest, UpdateTeacherProfessionalData } from '../../types';

// @desc Get teacher profile
// @route GET /api/teacher/profile
export const getTeacherProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const teacher = await prisma.user.findUnique({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving teacher profile' });
  }
};

// @desc Update teacher professional details
// @route PUT /api/teacher/update-professional
export const updateProfessionalDetails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { qualifications, experienceSummary }: UpdateTeacherProfessionalData = req.body;

    const updatedTeacher = await prisma.user.update({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating professional details' });
  }
};

// @desc Get all teachers
// @route GET /api/teacher/all
export const getAllTeachers = async (req: Request, res: Response): Promise<void> => {
  try {
    const teachers = await prisma.user.findMany({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving teachers' });
  }
};

// @desc Get teachers by qualifications (search)
// @route GET /api/teacher/search/:qualification
export const getTeachersByQualification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { qualification } = req.params;

    const teachers = await prisma.user.findMany({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving teachers by qualification' });
  }
};
