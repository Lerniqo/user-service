import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma';
import { sendPasswordResetEmail } from '../../services/email.service';
import { SecretCodeService } from '../../services/secretCode.service';
import { AuthenticatedRequest } from '../../types';

// PUT /password/change-password
export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { oldPassword, newPassword } = req.body;
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

    res.status(200).json({
      message: 'Password changed successfully',
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not change password' });
  }
};

// POST /password/request-reset
export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: 'Invalid email format.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, email: true, isActive: true }
    });

    if (!user || !user.isActive) {
      res.status(200).json({ message: 'If the email exists, a reset link has been sent.' });
      return;
    }

    const resetCode = SecretCodeService.generatePasswordResetCode();
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetCode: resetCode,
        passwordResetExpires: expires
      }
    });

    await sendPasswordResetEmail(user.email, resetCode);

    res.status(200).json({
      success: true,
      message: 'If the email exists, a reset link has been sent.'
    });
  } catch (error) {
    console.error('requestPasswordReset error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// POST /password/reset
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ message: 'Token and newPassword are required.' });
      return;
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters.' });
      return;
    }

    const user = await prisma.user.findFirst({
      where: { passwordResetCode: token }
    });

    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      res.status(400).json({ message: 'Invalid or expired reset token.' });
      return;
    }

    const hashed = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        passwordResetCode: null,
        passwordResetExpires: null
      }
    });

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully.'
    });
  } catch (error) {
    console.error('resetPassword error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};