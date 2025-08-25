import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma';
import { AuthenticatedRequest, UpdateProfileData, ChangePasswordData } from '../../types';

// @desc Update user profile
// @route PUT /api/user/update-profile
export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { fullName }: UpdateProfileData = req.body;
    const { userId } = req.user;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { fullName },
    });

    res.status(200).json({ 
      message: 'Profile updated successfully', 
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        role: updatedUser.role,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// @desc Change user password
// @route PUT /api/user/change-password
export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { oldPassword, newPassword }: ChangePasswordData = req.body;
    const { userId } = req.user;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Old password incorrect' });
      return;
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not change password' });
  }
};

// @desc Upload profile photo
// @route POST /api/user/upload-photo
export const uploadProfilePhoto = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const imagePath = `/uploads/${req.file.filename}`;
    const { userId } = req.user;

    await prisma.user.update({
      where: { id: userId },
      data: { profileImage: imagePath },
    });

    res.status(200).json({ 
      message: 'Photo uploaded successfully', 
      path: imagePath 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed' });
  }
};
