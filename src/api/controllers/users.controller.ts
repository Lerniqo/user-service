import { Request, Response } from 'express';
import prisma from '../../config/prisma';

// GET /users/students/:id (Admin only)
export const getStudentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const student = await prisma.user.findUnique({
      where: {
        id,
        role: 'Student',
        isActive: true,
      },
      include: {
        student: true,
      },
    });

    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    const formattedStudent = {
      userId: student.id,
      fullName: student.fullName,
      email: student.email,
      gradeLevel: student.student?.gradeLevel,
      learningGoals: student.student?.learningGoals || '',
      profileImage: student.profileImage,
      isVerified: student.isVerified,
      birthday: student.student?.birthday,
      school: student.student?.school || '',
      gender: student.student?.gender,
      parentGuardianName: student.student?.parentGuardianName || '',
      relationship: student.student?.relationship || '',
      parentContact: student.student?.parentContact || '',
      addressCity: student.student?.addressCity || '',
      createdAt: student.createdAt,
    };

    res.status(200).json({
      message: "Successfully retrieved student",
      data: {
        ...formattedStudent,
      },
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving student" });
  }
};

// GET /users (Admin only)
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
      },
      include: {
        student: true,
        teacher: true,
        admin: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedUsers = users.map(user => {
      let userData: any = {
        userId: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        isVerified: user.isVerified,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      // Add role-specific data
      if (user.role === 'Student' && user.student) {
        userData.gradeLevel = user.student.gradeLevel;
        userData.learningGoals = user.student.learningGoals;
      } else if (user.role === 'Teacher' && user.teacher) {
        userData.qualifications = user.teacher.qualifications;
        userData.shortBio = user.teacher.shortBio;
      } else if (user.role === 'Admin' && user.admin) {
        userData.department = user.admin.department;
      }

      return userData;
    });

    res.status(200).json({
      message: "Successfully retrieved users",
      data: {
        users: formattedUsers,
      },
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving users" });
  }
};

// PUT /users/:id (Admin only)
export const updateUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        student: true,
        teacher: true,
        admin: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    await prisma.$transaction(async (tx) => {
      // Update common user fields
      const commonFields: any = {};
      if (updateData.fullName !== undefined) commonFields.fullName = updateData.fullName;
      if (updateData.isActive !== undefined) commonFields.isActive = updateData.isActive;
      if (updateData.isVerified !== undefined) commonFields.isVerified = updateData.isVerified;

      if (Object.keys(commonFields).length > 0) {
        await tx.user.update({
          where: { id },
          data: commonFields,
        });
      }

      // Update role-specific fields
      if (user.role === 'Student' && user.student) {
        const studentFields: any = {};
        if (updateData.gradeLevel !== undefined) studentFields.gradeLevel = updateData.gradeLevel;
        if (updateData.learningGoals !== undefined) studentFields.learningGoals = updateData.learningGoals;

        if (Object.keys(studentFields).length > 0) {
          await tx.student.update({
            where: { userId: id },
            data: studentFields,
          });
        }
      } else if (user.role === 'Teacher' && user.teacher) {
        const teacherFields: any = {};
        if (updateData.qualifications !== undefined) teacherFields.qualifications = updateData.qualifications;
        if (updateData.shortBio !== undefined) teacherFields.shortBio = updateData.shortBio;
        // Backward compatibility: map experienceSummary to shortBio
        if (updateData.experienceSummary !== undefined) teacherFields.shortBio = updateData.experienceSummary;

        if (Object.keys(teacherFields).length > 0) {
          await tx.teacher.update({
            where: { userId: id },
            data: teacherFields,
          });
        }
      } else if (user.role === 'Admin' && user.admin) {
        const adminFields: any = {};
        if (updateData.department !== undefined) adminFields.department = updateData.department;

        if (Object.keys(adminFields).length > 0) {
          await tx.admin.update({
            where: { userId: id },
            data: adminFields,
          });
        }
      }
    });

    // Fetch and return updated user
    const updatedUser = await prisma.user.findUnique({
      where: { id },
      include: {
        student: true,
        teacher: true,
        admin: true,
      },
    });

    let userData: any = {
      userId: updatedUser!.id,
      email: updatedUser!.email,
      role: updatedUser!.role,
      fullName: updatedUser!.fullName,
      isVerified: updatedUser!.isVerified,
      isActive: updatedUser!.isActive,
      profileImage: updatedUser!.profileImage,
      createdAt: updatedUser!.createdAt,
      updatedAt: updatedUser!.updatedAt,
    };

    // Add role-specific data
    if (updatedUser!.role === 'Student' && updatedUser!.student) {
      userData.gradeLevel = updatedUser!.student.gradeLevel;
      userData.learningGoals = updatedUser!.student.learningGoals;
    } else if (updatedUser!.role === 'Teacher' && updatedUser!.teacher) {
      userData.qualifications = updatedUser!.teacher.qualifications;
      userData.shortBio = updatedUser!.teacher.shortBio;
    } else if (updatedUser!.role === 'Admin' && updatedUser!.admin) {
      userData.department = updatedUser!.admin.department;
    }

    res.status(200).json({
      message: "Successfully updated user",
      data: {
        user: userData,
      },
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user" });
  }
};
