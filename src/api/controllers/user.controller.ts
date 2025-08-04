import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import prisma from '../../config/prisma';
import { AuthenticatedRequest, UpdateProfileData, ChangePasswordData } from '../../types';

// @desc Update profile (firstName, lastName, email)
export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email }: UpdateProfileData = req.body;
    const { userId, role } = req.user;

    let updatedUser;

    if (role === 'STUDENT') {
      updatedUser = await prisma.student.update({
        where: { id: userId },
        data: { firstName, lastName, email },
      });
    } else if (role === 'TEACHER') {
      updatedUser = await prisma.teacher.update({
        where: { id: userId },
        data: { firstName, lastName, email },
      });
    } else if (role === 'ADMIN') {
      updatedUser = await prisma.admin.update({
        where: { id: userId },
        data: { firstName, lastName, email },
      });
    }

    res.status(200).json({ message: 'Profile updated', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// @desc Change password
export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { oldPassword, newPassword }: ChangePasswordData = req.body;
    const { userId, role } = req.user;

    let user;

    if (role === 'STUDENT') {
      user = await prisma.student.findUnique({
        where: { id: userId },
      });
    } else if (role === 'TEACHER') {
      user = await prisma.teacher.findUnique({
        where: { id: userId },
      });
    } else if (role === 'ADMIN') {
      user = await prisma.admin.findUnique({
        where: { id: userId },
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user!.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Old password incorrect' });
      return;
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    if (role === 'STUDENT') {
      await prisma.student.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });
    } else if (role === 'TEACHER') {
      await prisma.teacher.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });
    } else if (role === 'ADMIN') {
      await prisma.admin.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });
    }

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not change password' });
  }
};

// @desc Upload profile photo
export const uploadProfilePhoto = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const imagePath = `/uploads/${req.file.filename}`;
    const { userId, role } = req.user;

    if (role === 'STUDENT') {
      await prisma.student.update({
        where: { id: userId },
        data: { profileImage: imagePath },
      });
    } else if (role === 'TEACHER') {
      await prisma.teacher.update({
        where: { id: userId },
        data: { profileImage: imagePath },
      });
    } else if (role === 'ADMIN') {
      await prisma.admin.update({
        where: { id: userId },
        data: { profileImage: imagePath },
      });
    }

    res.status(200).json({ message: 'Photo uploaded', path: imagePath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed' });
  }
}; 