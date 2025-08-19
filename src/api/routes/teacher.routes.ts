import express, { Router } from 'express';
import { body } from 'express-validator';
import {
  getTeacherProfile,
  updateProfessionalDetails,
  getAllTeachers,
  getTeachersByDepartment,
  getTeachersByDesignation,
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
    body('department').optional().isString(),
    body('designation').optional().isString(),
    body('qualification').optional().isString(),
    body('specialization').optional().isString(),
    body('experience').optional().isInt({ min: 0 }),
  ],
  updateProfessionalDetails
);

// Admin routes (for managing teachers)
router.get('/all', getAllTeachers);
router.get('/department/:department', getTeachersByDepartment);
router.get('/designation/:designation', getTeachersByDesignation);

export default router; 