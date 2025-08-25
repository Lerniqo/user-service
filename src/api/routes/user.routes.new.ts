import express, { Router } from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import {
  updateProfile,
  changePassword,
  uploadProfilePhoto,
} from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';

const router: Router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});
const upload = multer({ storage });

// All user routes require authentication
router.use(protect);

// Profile management routes
router.put(
  '/update-profile',
  [
    body('fullName').optional().notEmpty().withMessage('Full name cannot be empty'),
  ],
  updateProfile
);

router.put(
  '/change-password',
  [
    body('oldPassword').notEmpty().withMessage('Old password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  changePassword
);

router.post(
  '/upload-photo',
  upload.single('profileImage'),
  uploadProfilePhoto
);

export default router;
