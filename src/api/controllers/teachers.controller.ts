import { Request, Response } from 'express';
import prisma from '../../config/prisma';

// GET /teachers
export const getAllTeachers = async (req: Request, res: Response): Promise<void> => {
  try {
    const teachers = await prisma.user.findMany({
      where: {
        role: 'Teacher',
        isActive: true,
        isVerified: true,
      },
      include: {
        teacher: true,
      },
    });

    const formattedTeachers = teachers.map(teacher => ({
      userId: teacher.id,
      fullName: teacher.fullName,
      qualifications: teacher.teacher?.qualifications || '',
      shortBio: teacher.teacher?.shortBio || '',
      profileImage: teacher.profileImage,
    }));

    res.status(200).json({
      message: "Successfully retrieved teachers",
      data: {
        teachers: formattedTeachers,
      },
      success: true,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving teachers" });
  }
};

// GET /teachers/:id
export const getTeacherById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const teacher = await prisma.user.findUnique({
      where: {
        id,
        role: 'Teacher',
        isActive: true,
        isVerified: true,
      },
      include: {
        teacher: true,
      },
    });

    if (!teacher) {
      res.status(404).json({ message: "Teacher not found" });
      return;
    }

    const formattedTeacher = {
      userId: teacher.id,
      fullName: teacher.fullName,
      email: teacher.email,
      qualifications: teacher.teacher?.qualifications || '',
      shortBio: teacher.teacher?.shortBio || '',
      profileImage: teacher.profileImage,
      isVerified: teacher.isVerified,
      birthday: teacher.teacher?.birthday,
      address: teacher.teacher?.address,
      phoneNumber: teacher.teacher?.phoneNumber,
      nationalIdPassport: teacher.teacher?.nationalIdPassport,
      yearsOfExperience: teacher.teacher?.yearsOfExperience,
      highestEducationLevel: teacher.teacher?.highestEducationLevel,
      createdAt: teacher.createdAt,
    };
    
    res.status(200).json({
      message: "Successfully retrieved teacher",
      data: {
        ...formattedTeacher,
      },
      success: true,
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving teacher" });
  }
};