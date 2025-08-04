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
    (0, express_validator_1.body)('password', 'Password must be 6 or more characters').isLength({
        min: 6,
    }),
    (0, express_validator_1.body)('firstName', 'First name is required').not().isEmpty(),
    (0, express_validator_1.body)('lastName', 'Last name is required').not().isEmpty(),
];
const loginValidation = [
    (0, express_validator_1.body)('email', 'Please include a valid email').isEmail(),
    (0, express_validator_1.body)('password', 'Password is required').exists(),
];
router.post('/register', registerValidation, auth_controller_1.register);
router.post('/verify-email', auth_controller_1.verifyEmail);
router.post('/login', loginValidation, auth_controller_1.login);
router.get('/profile', auth_middleware_1.protect, auth_controller_1.getProfile);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map