import express from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import {
  updateProfile,
  changePassword,
  uploadProfilePhoto,
} from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

// File upload setup (uploads folder must exist)
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});
const upload = multer({ storage });

// 🔒 Authenticated routes only
router.put(
  '/update-profile',
  protect,
  [
    body('firstName').notEmpty(),
    body('lastName').notEmpty(),
    body('email').isEmail(),
  ],
  updateProfile
);

router.put(
  '/change-password',
  protect,
  [
    body('oldPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 }),
  ],
  changePassword
);

router.post(
  '/upload-photo',
  protect,
  upload.single('profileImage'),
  uploadProfilePhoto
);

export default router; 