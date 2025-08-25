"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const teacher_controller_1 = require("../controllers/teacher.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
router.get('/profile', teacher_controller_1.getTeacherProfile);
router.put('/update-professional', [
    (0, express_validator_1.body)('qualifications').optional().isString(),
    (0, express_validator_1.body)('experienceSummary').optional().isString(),
], teacher_controller_1.updateProfessionalDetails);
router.get('/all', teacher_controller_1.getAllTeachers);
router.get('/search/:qualification', teacher_controller_1.getTeachersByQualification);
exports.default = router;
//# sourceMappingURL=teacher.routes.js.map