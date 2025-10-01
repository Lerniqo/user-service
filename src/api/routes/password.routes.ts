import express, { Router } from 'express';
import { body } from 'express-validator';
import {
  changePassword,
  requestPasswordReset,
  resetPassword,
} from '../controllers/password.controller';
import { protect } from '../middlewares/auth.middleware';

const router: Router = express.Router();

// Public routes
router.post(
  '/request-reset',
  [body('email', 'Please include a valid email').isEmail()],
  requestPasswordReset
);

router.post(
  '/reset',
  [
    body('token', 'Token is required').isString().notEmpty(),
    body('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 }),
  ],
  resetPassword
);

// Protected routes
router.put(
  '/change',
  protect,
  [
    body('oldPassword').notEmpty().withMessage('Old password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  changePassword
);

export default router;