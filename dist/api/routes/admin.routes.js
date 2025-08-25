"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
router.get('/profile', admin_controller_1.getAdminProfile);
router.put('/update-administrative', [
    (0, express_validator_1.body)('fullName').optional().isString(),
], admin_controller_1.updateAdministrativeDetails);
router.get('/all', admin_controller_1.getAllAdmins);
router.get('/statistics', admin_controller_1.getSystemStatistics);
router.get('/users/:role', admin_controller_1.getUsersByRole);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map