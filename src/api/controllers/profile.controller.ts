import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import prisma from '../../config/prisma';
import { AuthenticatedRequest } from '../../types';

// POST /profile/complete/:userId - Step 2: Complete profile after verification
export const completeProfile = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { userId } = req.params;
    const requestData = req.body;

    // Find the user and check if verified
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    if (!user.isVerified) {
      res.status(400).json({ message: "Email must be verified before completing profile." });
      return;
    }

    if (user.fullName !== "") {
      res.status(400).json({ message: "Profile already completed." });
      return;
    }

    // Role-specific validation for required fields
    const roleValidationErrors: string[] = [];
    
    if (user.role === "Student") {
      if (!requestData.birthday) roleValidationErrors.push("Birthday is required for students");
      if (!requestData.gradeLevel) roleValidationErrors.push("Grade level is required for students");
      if (!requestData.gender) roleValidationErrors.push("Gender is required for students");
      
      // Age validation for students (5-25 years)
      if (requestData.birthday) {
        const birthDate = new Date(requestData.birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        if (age < 5 || age > 25) {
          roleValidationErrors.push("Student age must be between 5 and 25 years");
        }
      }
    } else if (user.role === "Teacher") {
      if (!requestData.birthday) roleValidationErrors.push("Birthday is required for teachers");
      if (!requestData.address) roleValidationErrors.push("Address is required for teachers");
      if (!requestData.phoneNumber) roleValidationErrors.push("Phone number is required for teachers");
      if (!requestData.nationalIdPassport) roleValidationErrors.push("National ID/Passport is required for teachers");
      if (requestData.yearsOfExperience === undefined || requestData.yearsOfExperience === null) roleValidationErrors.push("Years of experience is required for teachers");
      if (!requestData.highestEducationLevel) roleValidationErrors.push("Highest education level is required for teachers");
      
      // Age validation for teachers (21-80 years)
      if (requestData.birthday) {
        const birthDate = new Date(requestData.birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        if (age < 21 || age > 80) {
          roleValidationErrors.push("Teacher age must be between 21 and 80 years");
        }
      }
    }

    if (roleValidationErrors.length > 0) {
      res.status(400).json({ 
        message: "Validation failed", 
        errors: roleValidationErrors.map(error => ({ msg: error, param: "role_specific" }))
      });
      return;
    }

    // Complete profile with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user with full name
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          fullName: requestData.fullName,
        },
      });

      // Create role-specific profile with comprehensive data
      if (user.role === "Student") {
        await tx.student.create({
          data: {
            userId: user.id,
            school: requestData.school || null,
            birthday: new Date(requestData.birthday),
            gradeLevel: requestData.gradeLevel,
            gender: requestData.gender,
            learningGoals: requestData.learningGoals || null,
            parentGuardianName: requestData.parentGuardianName || null,
            relationship: requestData.relationship || null,
            parentContact: requestData.parentContact || null,
            addressCity: requestData.addressCity || null,
          },
        });
      } else if (user.role === "Teacher") {
        await tx.teacher.create({
          data: {
            userId: user.id,
            birthday: new Date(requestData.birthday),
            address: requestData.address,
            phoneNumber: requestData.phoneNumber,
            nationalIdPassport: requestData.nationalIdPassport,
            yearsOfExperience: requestData.yearsOfExperience,
            highestEducationLevel: requestData.highestEducationLevel,
            qualifications: requestData.qualifications || null,
            shortBio: requestData.shortBio || null,
          },
        });
      } else if (user.role === "Admin") {
        // Maintain backward compatibility for Admin role
        await tx.admin.create({
          data: {
            userId: user.id,
            department: requestData.department || null,
          },
        });
      }

      return updatedUser;
    });

    res.status(200).json({
      message: "Profile completed successfully! You can now log in.",
      userId: result.id,
      email: result.email,
      role: result.role,
      fullName: result.fullName,
    });
  } catch (error) {
    console.error('Complete profile error:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET /profile/me
export const getMyProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.user;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
        teacher: true,
        admin: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    let profileData: any = {
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      isVerified: user.isVerified,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isProfileCompleted: true,
    };

    // Add role-specific data
    if (user.role === 'Student' && user.student) {
      profileData.gradeLevel = user.student.gradeLevel;
      profileData.learningGoals = user.student.learningGoals;
    } else if (user.role === 'Teacher' && user.teacher) {
      profileData.qualifications = user.teacher.qualifications;
      profileData.shortBio = user.teacher.shortBio;
    } else if (user.role === 'Admin' && user.admin) {
      profileData.department = user.admin.department;
    } else {
      profileData.isProfileCompleted = false
    }

    res.status(200).json(profileData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// PUT /profile/me
export const updateMyProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId, role } = req.user;
    const updateData = req.body;

    await prisma.$transaction(async (tx) => {
      // Update common user fields
      const commonFields: any = {};
      if (updateData.fullName) commonFields.fullName = updateData.fullName;

      if (Object.keys(commonFields).length > 0) {
        await tx.user.update({
          where: { id: userId },
          data: commonFields,
        });
      }

      // Update role-specific fields
      if (role === 'Student') {
        const studentFields: any = {};
        if (updateData.gradeLevel !== undefined) studentFields.gradeLevel = updateData.gradeLevel;
        if (updateData.learningGoals !== undefined) studentFields.learningGoals = updateData.learningGoals;

        if (Object.keys(studentFields).length > 0) {
          await tx.student.update({
            where: { userId },
            data: studentFields,
          });
        }
      } else if (role === 'Teacher') {
        const teacherFields: any = {};
        if (updateData.qualifications !== undefined) teacherFields.qualifications = updateData.qualifications;
        if (updateData.shortBio !== undefined) teacherFields.shortBio = updateData.shortBio;
        // Backward compatibility: map experienceSummary to shortBio
        if (updateData.experienceSummary !== undefined) teacherFields.shortBio = updateData.experienceSummary;

        if (Object.keys(teacherFields).length > 0) {
          await tx.teacher.update({
            where: { userId },
            data: teacherFields,
          });
        }
      } else if (role === 'Admin') {
        const adminFields: any = {};
        if (updateData.department !== undefined) adminFields.department = updateData.department;

        if (Object.keys(adminFields).length > 0) {
          await tx.admin.update({
            where: { userId },
            data: adminFields,
          });
        }
      }
    });

    // Fetch and return updated profile
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
        teacher: true,
        admin: true,
      },
    });

    let profileData: any = {
      userId: updatedUser!.id,
      email: updatedUser!.email,
      role: updatedUser!.role,
      fullName: updatedUser!.fullName,
      isVerified: updatedUser!.isVerified,
      profileImage: updatedUser!.profileImage,
      createdAt: updatedUser!.createdAt,
      updatedAt: updatedUser!.updatedAt,
    };

    // Add role-specific data
    if (updatedUser!.role === 'Student' && updatedUser!.student) {
      profileData.gradeLevel = updatedUser!.student.gradeLevel;
      profileData.learningGoals = updatedUser!.student.learningGoals;
    } else if (updatedUser!.role === 'Teacher' && updatedUser!.teacher) {
      profileData.qualifications = updatedUser!.teacher.qualifications;
      profileData.shortBio = updatedUser!.teacher.shortBio;
    } else if (updatedUser!.role === 'Admin' && updatedUser!.admin) {
      profileData.department = updatedUser!.admin.department;
    }

    res.status(200).json(profileData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating profile" });
  }
};

// DELETE /profile/me
export const deleteMyAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.user;

    await prisma.user.delete({
      where: { id: userId },
    });

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting account" });
  }
};