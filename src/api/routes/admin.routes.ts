import express, { Router } from 'express';
import { body } from 'express-validator';
import {
  getAdminProfile,
  updateAdministrativeDetails,
  getAllAdmins,
  getSystemStatistics,
  getUsersByRole,
} from '../controllers/admin.controller';
import { protect } from '../middlewares/auth.middleware';

const router: Router = express.Router();

// 🔒 All routes require authentication
router.use(protect);

// Admin-specific routes
router.get('/profile', getAdminProfile);
router.put(
  '/update-administrative',
  [
    body('department').optional().isString(),
    body('designation').optional().isString(),
    body('permissions').optional().isArray(),
  ],
  updateAdministrativeDetails
);

// System management routes
router.get('/all', getAllAdmins);
router.get('/statistics', getSystemStatistics);
router.get('/users/:role', getUsersByRole);

export default router; 