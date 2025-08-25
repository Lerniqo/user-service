import express, { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getProfile,
} from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';

const router: Router = express.Router();

const registerValidation = [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
  body('firstName', 'First name is required').not().isEmpty(),
  body('lastName', 'Last name is required').not().isEmpty(),
];

const loginValidation = [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists(),
];

const verifyEmailValidation = [
  body('code', 'Verification code is required').not().isEmpty(),
];

const resetPasswordValidation = [
  body('code', 'Reset code is required').not().isEmpty(),
  body('newPassword', 'New password must be 6 or more characters').isLength({ min: 6 }),
];

// Public routes
router.post('/register', registerValidation, register);
router.post('/verify-email', verifyEmailValidation, verifyEmail);
router.post('/login', loginValidation, login);
router.post('/forgot-password', body('email', 'Email is required').isEmail(), forgotPassword);
router.post('/reset-password', resetPasswordValidation, resetPassword);

// Protected routes
router.post('/logout', protect, logout);
router.get('/profile', protect, getProfile);

export default router; 