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
    (0, express_validator_1.body)('gradeLevel').optional().isInt({ min: 1, max: 12 }),
    (0, express_validator_1.body)('learningGoals').optional().isString(),
], student_controller_1.updateAcademicDetails);
router.get('/all', student_controller_1.getAllStudents);
router.get('/grade/:gradeLevel', student_controller_1.getStudentsByGradeLevel);
exports.default = router;
//# sourceMappingURL=student.routes.js.map