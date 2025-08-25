"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const users_controller_1 = require("../controllers/users.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
const registerValidation = [
    (0, express_validator_1.body)('email', 'Please include a valid email').isEmail(),
    (0, express_validator_1.body)('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    (0, express_validator_1.body)('role', 'Role must be Student, Teacher, or Admin').isIn(['Student', 'Teacher', 'Admin']),
];
const loginValidation = [
    (0, express_validator_1.body)('email', 'Please include a valid email').isEmail(),
    (0, express_validator_1.body)('password', 'Password is required').exists(),
];
const verifyEmailValidation = [
    (0, express_validator_1.body)('code', 'Verification code is required').not().isEmpty(),
];
const completeProfileValidation = [
    (0, express_validator_1.body)('fullName', 'Full name is required').not().isEmpty(),
    (0, express_validator_1.body)('gradeLevel').optional().isInt({ min: 1, max: 12 }).withMessage('Grade level must be between 1 and 12'),
    (0, express_validator_1.body)('learningGoals').optional().isString().withMessage('Learning goals must be a string'),
    (0, express_validator_1.body)('qualifications').optional().isString().withMessage('Qualifications must be a string'),
    (0, express_validator_1.body)('experienceSummary').optional().isString().withMessage('Experience summary must be a string'),
    (0, express_validator_1.body)('department').optional().isString().withMessage('Department must be a string'),
];
const updateProfileValidation = [
    (0, express_validator_1.body)('fullName').optional().isString().withMessage('Full name must be a string'),
    (0, express_validator_1.body)('gradeLevel').optional().isInt({ min: 1, max: 12 }).withMessage('Grade level must be between 1 and 12'),
    (0, express_validator_1.body)('learningGoals').optional().isString().withMessage('Learning goals must be a string'),
    (0, express_validator_1.body)('qualifications').optional().isString().withMessage('Qualifications must be a string'),
    (0, express_validator_1.body)('experienceSummary').optional().isString().withMessage('Experience summary must be a string'),
    (0, express_validator_1.body)('department').optional().isString().withMessage('Department must be a string'),
];
router.post('/register', registerValidation, users_controller_1.register);
router.post('/verify-email', verifyEmailValidation, users_controller_1.verifyEmail);
router.post('/complete-profile/:userId', completeProfileValidation, users_controller_1.completeProfile);
router.post('/login', loginValidation, users_controller_1.login);
router.post('/refresh-token', users_controller_1.refreshToken);
router.get('/teachers', users_controller_1.getAllTeachers);
router.get('/teachers/:id', users_controller_1.getTeacherById);
router.use(auth_middleware_1.protect);
router.get('/me', users_controller_1.getMyProfile);
router.put('/me', updateProfileValidation, users_controller_1.updateMyProfile);
router.delete('/me', users_controller_1.deleteMyAccount);
router.post('/logout', users_controller_1.logout);
router.get('/students/:id', (0, auth_middleware_1.checkRole)(['Admin']), users_controller_1.getStudentById);
router.get('/', (0, auth_middleware_1.checkRole)(['Admin']), users_controller_1.getAllUsers);
router.put('/:id', (0, auth_middleware_1.checkRole)(['Admin']), users_controller_1.updateUserById);
exports.default = router;
//# sourceMappingURL=users.routes.js.map