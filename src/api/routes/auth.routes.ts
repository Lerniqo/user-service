import express, { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  refreshToken,
  logout,
} from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';

const router: Router = express.Router();

// Validation middleware
const registerValidation = [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
  body('role', 'Role must be Student, Teacher, or Admin').isIn(['Student', 'Teacher', 'Admin']),
];

const loginValidation = [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists(),
];

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.post('/logout', protect, logout);

export default router;