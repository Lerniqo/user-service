import express, { Router } from 'express';
import {
  getAllTeachers,
  getTeacherById,
} from '../controllers/teachers.controller';

const router: Router = express.Router();

// Public routes
router.get('/', getAllTeachers);
router.get('/:id', getTeacherById);

export default router;