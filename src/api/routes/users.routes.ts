import express, { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  verifyEmail,
  login,
  refreshToken,
  logout,
  getMyProfile,
  updateMyProfile,
  deleteMyAccount,
  getAllTeachers,
  getTeacherById,
  getStudentById,
  getAllUsers,
  updateUserById,
  completeProfile,
} from '../controllers/users.controller';
import { protect, checkRole } from '../middlewares/auth.middleware';

const router: Router = express.Router();

// Validation middleware
const registerValidation = [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
  body('role', 'Role must be Student, Teacher, or Admin').isIn(['Student', 'Teacher', 'Admin']),
];

const loginValidation = [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists(),
];

const verifyEmailValidation = [
  body('code', 'Verification code is required').not().isEmpty(),
];

const completeProfileValidation = [
  body('fullName', 'Full name is required').not().isEmpty(),
  body('gradeLevel').optional().isInt({ min: 1, max: 12 }).withMessage('Grade level must be between 1 and 12'),
  body('learningGoals').optional().isString().withMessage('Learning goals must be a string'),
  body('qualifications').optional().isString().withMessage('Qualifications must be a string'),
  body('experienceSummary').optional().isString().withMessage('Experience summary must be a string'),
  body('department').optional().isString().withMessage('Department must be a string'),
];

const updateProfileValidation = [
  body('fullName').optional().isString().withMessage('Full name must be a string'),
  body('gradeLevel').optional().isInt({ min: 1, max: 12 }).withMessage('Grade level must be between 1 and 12'),
  body('learningGoals').optional().isString().withMessage('Learning goals must be a string'),
  body('qualifications').optional().isString().withMessage('Qualifications must be a string'),
  body('experienceSummary').optional().isString().withMessage('Experience summary must be a string'),
  body('department').optional().isString().withMessage('Department must be a string'),
];

// Public routes
router.post('/register', registerValidation, register);
router.post('/verify-email', verifyEmailValidation, verifyEmail);
router.post('/complete-profile/:userId', completeProfileValidation, completeProfile);
router.post('/login', loginValidation, login);
router.post('/refresh-token', refreshToken);

// Public teacher routes
router.get('/teachers', getAllTeachers);
router.get('/teachers/:id', getTeacherById);

// Protected routes
router.use(protect); // All routes below require authentication

// User profile management
router.get('/me', getMyProfile);
router.put('/me', updateProfileValidation, updateMyProfile);
router.delete('/me', deleteMyAccount);
router.post('/logout', logout);

// Admin-only routes
router.get('/students/:id', checkRole(['Admin']), getStudentById);
router.get('/', checkRole(['Admin']), getAllUsers);
router.put('/:id', checkRole(['Admin']), updateUserById);

export default router;
