import express, { Router } from 'express';
import { body } from 'express-validator';
import {
  completeProfile,
  getMyProfile,
  updateMyProfile,
  deleteMyAccount,
} from '../controllers/profile.controller';
import { protect } from '../middlewares/auth.middleware';

const router: Router = express.Router();

// Validation middleware
const completeProfileValidation = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  
  body('birthday')
    .isISO8601()
    .withMessage('Birthday must be a valid date (YYYY-MM-DD format)')
    .custom((value, { req }) => {
      const birthDate = new Date(value);
      let age = new Date().getFullYear() - birthDate.getFullYear();
      const monthDiff = new Date().getMonth() - birthDate.getMonth();
      
      // Adjust age if birthday hasn't occurred this year
      if (monthDiff < 0 || (monthDiff === 0 && new Date().getDate() < birthDate.getDate())) {
        age--;
      }
      
      // Note: We'll validate role-specific age ranges in the controller after fetching user role
      if (age < 5 || age > 80) {
        throw new Error('Age must be between 5 and 80 years');
      }
      return true;
    }),

  // Student-specific validation (will be conditionally applied in controller)
  body('gradeLevel')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Grade level must be between 1 and 12'),
    
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other', 'Prefer not to say'])
    .withMessage('Invalid gender value'),
    
  body('school')
    .optional()
    .isLength({ max: 200 })
    .withMessage('School name must not exceed 200 characters'),
    
  body('learningGoals')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Learning goals must not exceed 1000 characters'),
    
  body('parentGuardianName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Parent/Guardian name must not exceed 100 characters'),
    
  body('relationship')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Relationship must not exceed 50 characters'),
    
  body('parentContact')
    .optional()
    .custom((value) => {
      if (!value) return true;
      
      // Check if it's an email or phone number
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^0[1-9][\d]{8}$/; // Basic international phone format
      
      if (!emailRegex.test(value) && !phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
        throw new Error('Parent contact must be a valid email or phone number');
      }
      return true;
    }),
    
  body('addressCity')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Address/City must not exceed 200 characters'),

  // Teacher-specific validation (will be conditionally applied in controller)
  body('address')
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage('Address must be between 10 and 500 characters'),
    
  body('phoneNumber')
    .optional()
    .custom((value) => {
      if (!value) return true;
      
      // Basic phone validation - accepts international format
      const phoneRegex = /^0[1-9][\d]{8}$/;
      const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
      
      if (!phoneRegex.test(cleanPhone)) {
        throw new Error('Invalid phone number format');
      }
      return true;
    }),
    
  body('nationalIdPassport')
    .optional()
    .isLength({ min: 5, max: 50 })
    .isAlphanumeric()
    .withMessage('National ID/Passport must be 5-50 alphanumeric characters'),
    
  body('yearsOfExperience')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Years of experience must be between 0 and 50'),
    
  body('highestEducationLevel')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Highest education level must not exceed 200 characters'),
    
  body('qualifications')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Qualifications must not exceed 2000 characters'),
    
  body('shortBio')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Short bio must not exceed 1000 characters'),

  // Legacy fields for backward compatibility
  body('experienceSummary')
    .optional()
    .isString()
    .withMessage('Experience summary must be a string'),
    
  body('department')
    .optional()
    .isString()
    .withMessage('Department must be a string'),
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
router.post('/complete/:userId', completeProfileValidation, completeProfile);

// Protected routes
router.use(protect); // All routes below require authentication

router.get('/me', getMyProfile);
router.put('/me', updateProfileValidation, updateMyProfile);
router.delete('/me', deleteMyAccount);

export default router;