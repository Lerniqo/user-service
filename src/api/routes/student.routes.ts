import express from 'express';
import { body } from 'express-validator';
import {
  getStudentProfile,
  updateAcademicDetails,
  getAllStudents,
  getStudentsByDepartment,
} from '../controllers/student.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

// 🔒 All routes require authentication
router.use(protect);

// Student-specific routes
router.get('/profile', getStudentProfile);
router.put(
  '/update-academic',
  [
    body('department').optional().isString(),
    body('yearOfStudy').optional().isInt({ min: 1, max: 8 }),
    body('semester').optional().isInt({ min: 1, max: 16 }),
    body('gpa').optional().isFloat({ min: 0, max: 4 }),
  ],
  updateAcademicDetails
);

// Admin routes (for managing students)
router.get('/all', getAllStudents);
router.get('/department/:department', getStudentsByDepartment);

export default router; 