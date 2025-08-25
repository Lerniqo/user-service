import express, { Router } from 'express';
import { body } from 'express-validator';
import {
  getStudentProfile,
  updateAcademicDetails,
  getAllStudents,
  getStudentsByGradeLevel,
} from '../controllers/student.controller';
import { protect } from '../middlewares/auth.middleware';

const router: Router = express.Router();

// 🔒 All routes require authentication
router.use(protect);

// Student-specific routes
router.get('/profile', getStudentProfile);
router.put(
  '/update-academic',
  [
    body('gradeLevel').optional().isInt({ min: 1, max: 12 }),
    body('learningGoals').optional().isString(),
  ],
  updateAcademicDetails
);

// Admin routes (for managing students)
router.get('/all', getAllStudents);
router.get('/grade/:gradeLevel', getStudentsByGradeLevel);

export default router; 