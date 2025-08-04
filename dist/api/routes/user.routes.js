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
router.put('/update-profile', auth_middleware_1.protect, [
    (0, express_validator_1.body)('firstName').notEmpty(),
    (0, express_validator_1.body)('lastName').notEmpty(),
    (0, express_validator_1.body)('email').isEmail(),
], user_controller_1.updateProfile);
router.put('/change-password', auth_middleware_1.protect, [
    (0, express_validator_1.body)('oldPassword').notEmpty(),
    (0, express_validator_1.body)('newPassword').isLength({ min: 6 }),
], user_controller_1.changePassword);
router.post('/upload-photo', auth_middleware_1.protect, upload.single('profileImage'), user_controller_1.uploadProfilePhoto);
exports.default = router;
//# sourceMappingURL=user.routes.js.map