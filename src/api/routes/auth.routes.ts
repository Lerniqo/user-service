import express from 'express';
import { body } from 'express-validator';
import {
  register,
  verifyEmail,
  login,
  getProfile,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

const registerValidation = [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password must be 6 or more characters').isLength({
    min: 6,
  }),
  body('firstName', 'First name is required').not().isEmpty(),
  body('lastName', 'Last name is required').not().isEmpty(),
];

const loginValidation = [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists(),
];

router.post('/register', registerValidation, register);
router.post('/verify-email', verifyEmail);
router.post('/login', loginValidation, login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// This is a protected route. Only authenticated users can access it.
router.get('/profile', protect, getProfile);

export default router; 