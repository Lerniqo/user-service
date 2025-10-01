import express, { Router } from 'express';
import { body } from 'express-validator';
import {
  verifyEmail,
  resendVerificationCode,
} from '../controllers/verification.controller';

const router: Router = express.Router();

// Validation middleware
const verifyEmailValidation = [
  body('email', 'Please include a valid email').isEmail(),
  body('code', 'Verification code must be 6 digits').isLength({ min: 6, max: 6 }).isNumeric(),
];

const resendVerificationValidation = [
  body('email', 'Please include a valid email').isEmail(),
];

// Public routes
router.post('/verify-email', verifyEmailValidation, verifyEmail);
router.post('/resend-verification', resendVerificationValidation, resendVerificationCode);

export default router;