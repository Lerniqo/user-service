import express, { Router } from 'express';
import { body } from 'express-validator';
import {
  getTeacherProfile,
  updateProfessionalDetails,
  getAllTeachers,
  getTeachersByQualification,
} from '../controllers/teacher.controller';
import { protect } from '../middlewares/auth.middleware';

const router: Router = express.Router();

// 🔒 All routes require authentication
router.use(protect);

// Teacher-specific routes
router.get('/profile', getTeacherProfile);
router.put(
  '/update-professional',
  [
    body('qualifications').optional().isString(),
    body('experienceSummary').optional().isString(),
  ],
  updateProfessionalDetails
);

// Admin routes (for managing teachers)
router.get('/all', getAllTeachers);
router.get('/search/:qualification', getTeachersByQualification);

export default router; 