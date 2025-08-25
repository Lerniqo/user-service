"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const multer_1 = __importDefault(require("multer"));
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    },
});
const upload = (0, multer_1.default)({ storage });
router.use(auth_middleware_1.protect);
router.put('/update-profile', [
    (0, express_validator_1.body)('fullName').optional().notEmpty().withMessage('Full name cannot be empty'),
], user_controller_1.updateProfile);
router.put('/change-password', [
    (0, express_validator_1.body)('oldPassword').notEmpty().withMessage('Old password is required'),
    (0, express_validator_1.body)('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], user_controller_1.changePassword);
router.post('/upload-photo', upload.single('profileImage'), user_controller_1.uploadProfilePhoto);
exports.default = router;
//# sourceMappingURL=user.routes.js.map