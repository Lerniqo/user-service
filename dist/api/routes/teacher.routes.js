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
    (0, express_validator_1.body)('department').optional().isString(),
    (0, express_validator_1.body)('designation').optional().isString(),
    (0, express_validator_1.body)('qualification').optional().isString(),
    (0, express_validator_1.body)('specialization').optional().isString(),
    (0, express_validator_1.body)('experience').optional().isInt({ min: 0 }),
], teacher_controller_1.updateProfessionalDetails);
router.get('/all', teacher_controller_1.getAllTeachers);
router.get('/department/:department', teacher_controller_1.getTeachersByDepartment);
router.get('/designation/:designation', teacher_controller_1.getTeachersByDesignation);
exports.default = router;
//# sourceMappingURL=teacher.routes.js.map