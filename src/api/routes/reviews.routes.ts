import express, { Router } from 'express';
import { body } from 'express-validator';
import {
  createTeacherReview,
  getTeacherReviews,
  updateTeacherReview,
  deleteTeacherReview,
} from '../controllers/reviews.controller';
import { protect, checkRole } from '../middlewares/auth.middleware';

const router: Router = express.Router();

// Review validation middleware
const createReviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Comment must not exceed 1000 characters'),
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('isAnonymous must be a boolean'),
];

const updateReviewValidation = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Comment must not exceed 1000 characters'),
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('isAnonymous must be a boolean'),
];

// Public routes - anyone can view reviews
router.get('/teachers/:id/reviews', getTeacherReviews);

// Protected routes
router.use(protect);

// Student-only routes for creating reviews
router.post('/teachers/:id/reviews', checkRole(['Student']), createReviewValidation, createTeacherReview);

// Student can update their own reviews, Admin can update any
router.put('/:id', checkRole(['Student']), updateReviewValidation, updateTeacherReview);

// Student can delete their own reviews, Admin can delete any
router.delete('/:id', checkRole(['Student', 'Admin']), deleteTeacherReview);

export default router;