"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const student_controller_1 = require("../controllers/student.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
router.get('/profile', student_controller_1.getStudentProfile);
router.put('/update-academic', [
    (0, express_validator_1.body)('department').optional().isString(),
    (0, express_validator_1.body)('yearOfStudy').optional().isInt({ min: 1, max: 8 }),
    (0, express_validator_1.body)('semester').optional().isInt({ min: 1, max: 16 }),
    (0, express_validator_1.body)('gpa').optional().isFloat({ min: 0, max: 4 }),
], student_controller_1.updateAcademicDetails);
router.get('/all', student_controller_1.getAllStudents);
router.get('/department/:department', student_controller_1.getStudentsByDepartment);
exports.default = router;
//# sourceMappingURL=student.routes.js.map