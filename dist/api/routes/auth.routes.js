"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
const registerValidation = [
    (0, express_validator_1.body)('email', 'Please include a valid email').isEmail(),
    (0, express_validator_1.body)('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    (0, express_validator_1.body)('firstName', 'First name is required').not().isEmpty(),
    (0, express_validator_1.body)('lastName', 'Last name is required').not().isEmpty(),
];
const loginValidation = [
    (0, express_validator_1.body)('email', 'Please include a valid email').isEmail(),
    (0, express_validator_1.body)('password', 'Password is required').exists(),
];
const verifyEmailValidation = [
    (0, express_validator_1.body)('code', 'Verification code is required').not().isEmpty(),
];
const resetPasswordValidation = [
    (0, express_validator_1.body)('code', 'Reset code is required').not().isEmpty(),
    (0, express_validator_1.body)('newPassword', 'New password must be 6 or more characters').isLength({ min: 6 }),
];
router.post('/register', registerValidation, auth_controller_1.register);
router.post('/verify-email', verifyEmailValidation, auth_controller_1.verifyEmail);
router.post('/login', loginValidation, auth_controller_1.login);
router.post('/forgot-password', (0, express_validator_1.body)('email', 'Email is required').isEmail(), auth_controller_1.forgotPassword);
router.post('/reset-password', resetPasswordValidation, auth_controller_1.resetPassword);
router.post('/logout', auth_middleware_1.protect, auth_controller_1.logout);
router.get('/profile', auth_middleware_1.protect, auth_controller_1.getProfile);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map