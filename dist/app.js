"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = __importDefault(require("./api/routes/auth.routes"));
const user_routes_1 = __importDefault(require("./api/routes/user.routes"));
const student_routes_1 = __importDefault(require("./api/routes/student.routes"));
const teacher_routes_1 = __importDefault(require("./api/routes/teacher.routes"));
const admin_routes_1 = __importDefault(require("./api/routes/admin.routes"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: [env_1.config.cors.frontendUrl, "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.get('/', (req, res) => {
    res.send('User Service is running!');
});
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/user', user_routes_1.default);
app.use('/api/student', student_routes_1.default);
app.use('/api/teacher', teacher_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/uploads', express_1.default.static('uploads'));
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        message: 'Internal Server Error',
        error: env_1.config.server.nodeEnv === 'development' ? err.message : 'Something went wrong'
    });
});
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
exports.default = app;
//# sourceMappingURL=app.js.map