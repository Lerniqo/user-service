"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    database: {
        url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5433/userservice',
    },
    secret: {
        key: process.env.SECRET_KEY || 'your-super-secret-key-change-this-in-production',
    },
    email: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        user: process.env.SMTP_USER || 'your-email@gmail.com',
        pass: process.env.SMTP_PASS || 'your-app-password',
    },
    server: {
        port: parseInt(process.env.PORT || '4001'),
        nodeEnv: process.env.NODE_ENV || 'development',
    },
    cors: {
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    },
};
//# sourceMappingURL=env.js.map