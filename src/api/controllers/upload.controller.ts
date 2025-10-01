import { Response } from 'express';
import prisma from '../../config/prisma';
import { AuthenticatedRequest } from '../../types';

// POST /upload/profile-photo  
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
      data: {
        profileImage: imagePath,
      },
      success: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed' });
  }
};