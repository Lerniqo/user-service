import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import { AuthenticatedRequest, UpdateAdminAdministrativeData, SystemStatistics } from '../../types';

// @desc Get admin profile with administrative details
// @route GET /api/admin/profile
export const getAdminProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const admin = await prisma.admin.findUnique({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving admin profile' });
  }
};

// @desc Update admin administrative details
// @route PUT /api/admin/update-administrative
export const updateAdministrativeDetails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { department, designation, permissions }: UpdateAdminAdministrativeData = req.body;

    const updatedAdmin = await prisma.admin.update({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating administrative details' });
  }
};

// @desc Get all admins
// @route GET /api/admin/all
export const getAllAdmins = async (req: Request, res: Response): Promise<void> => {
  try {
    const admins = await prisma.admin.findMany({
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
      prisma.student.count({ where: { isActive: true } }),
      prisma.teacher.count({ where: { isActive: true } }),
      prisma.admin.count({ where: { isActive: true } }),
      prisma.student.count({ where: { isVerified: true, isActive: true } }),
      prisma.teacher.count({ where: { isVerified: true, isActive: true } }),
      prisma.admin.count({ where: { isVerified: true, isActive: true } }),
      prisma.student.count({ where: { isVerified: false, isActive: true } }),
      prisma.teacher.count({ where: { isVerified: false, isActive: true } }),
      prisma.admin.count({ where: { isVerified: false, isActive: true } })
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
    
    let users: any[] = [];
    
    if (role === 'STUDENT') {
      users = await prisma.student.findMany({
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
    } else if (role === 'TEACHER') {
      users = await prisma.teacher.findMany({
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
    } else if (role === 'ADMIN') {
      users = await prisma.admin.findMany({
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
    } else {
      res.status(400).json({ message: 'Invalid role specified' });
      return;
    }

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