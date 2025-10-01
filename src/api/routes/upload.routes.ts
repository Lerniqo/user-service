import express, { Router } from 'express';
import multer from 'multer';
import {
  uploadProfilePhoto,
} from '../controllers/upload.controller';
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

// Protected routes - require authentication
router.use(protect);

router.post(
  '/profile-photo',
  upload.single('profileImage'),
  uploadProfilePhoto
);

export default router;