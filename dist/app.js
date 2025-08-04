"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./api/routes/auth.routes"));
const user_routes_1 = __importDefault(require("./api/routes/user.routes"));
const student_routes_1 = __importDefault(require("./api/routes/student.routes"));
const teacher_routes_1 = __importDefault(require("./api/routes/teacher.routes"));
const admin_routes_1 = __importDefault(require("./api/routes/admin.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send('User Service is running!');
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/user', user_routes_1.default);
app.use('/api/student', student_routes_1.default);
app.use('/api/teacher', teacher_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/uploads', express_1.default.static('uploads'));
exports.default = app;
//# sourceMappingURL=app.js.map