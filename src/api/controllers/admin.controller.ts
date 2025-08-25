import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { AuthenticatedRequest, UpdateAdminAdministrativeData, SystemStatistics } from '../../types';

// @desc Get admin profile with administrative details
// @route GET /api/admin/profile
export const getAdminProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const admin = await prisma.user.findUnique({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving admin profile' });
  }
};

// @desc Update admin administrative details
// @route PUT /api/admin/update-administrative
export const updateAdministrativeDetails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { fullName }: UpdateAdminAdministrativeData = req.body;

    const updatedAdmin = await prisma.user.update({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating administrative details' });
  }
};

// @desc Get all admins
// @route GET /api/admin/all
export const getAllAdmins = async (req: Request, res: Response): Promise<void> => {
  try {
    const admins = await prisma.user.findMany({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving admins' });
  }
};

// @desc Get system statistics (Admin only)
// @route GET /api/admin/statistics
export const getSystemStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalStudents,
      totalTeachers,
      totalAdmins,
      verifiedStudents,
      verifiedTeachers,
      verifiedAdmins,
      unverifiedStudents,
      unverifiedTeachers,
      unverifiedAdmins
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'Student', isActive: true } }),
      prisma.user.count({ where: { role: 'Teacher', isActive: true } }),
      prisma.user.count({ where: { role: 'Admin', isActive: true } }),
      prisma.user.count({ where: { role: 'Student', isVerified: true, isActive: true } }),
      prisma.user.count({ where: { role: 'Teacher', isVerified: true, isActive: true } }),
      prisma.user.count({ where: { role: 'Admin', isVerified: true, isActive: true } }),
      prisma.user.count({ where: { role: 'Student', isVerified: false, isActive: true } }),
      prisma.user.count({ where: { role: 'Teacher', isVerified: false, isActive: true } }),
      prisma.user.count({ where: { role: 'Admin', isVerified: false, isActive: true } })
    ]);

    const totalUsers = totalStudents + totalTeachers + totalAdmins;
    const verifiedUsers = verifiedStudents + verifiedTeachers + verifiedAdmins;
    const unverifiedUsers = unverifiedStudents + unverifiedTeachers + unverifiedAdmins;

    const statistics: SystemStatistics = {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving system statistics' });
  }
};

// @desc Get users by role (Admin only)
// @route GET /api/admin/users/:role
export const getUsersByRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.params;

    if (!['Student', 'Teacher', 'Admin'].includes(role)) {
      res.status(400).json({ message: 'Invalid role specified' });
      return;
    }

    const users = await prisma.user.findMany({
      where: { 
        role: role as 'Student' | 'Teacher' | 'Admin',
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving users by role' });
  }
}; 