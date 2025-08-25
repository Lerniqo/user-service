"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = exports.protect = void 0;
const secretCode_service_1 = require("../../services/secretCode.service");
const protect = (req, res, next) => {
    let sessionCode;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        sessionCode = req.headers.authorization.split(' ')[1];
    }
    if (!sessionCode && req.cookies.sessionCode) {
        sessionCode = req.cookies.sessionCode;
    }
    if (!sessionCode && req.cookies.accessToken) {
        sessionCode = req.cookies.accessToken;
    }
    if (!sessionCode) {
        res.status(401).json({ message: 'Not authorized, no token provided' });
        return;
    }
    try {
        const userData = secretCode_service_1.SecretCodeService.validateSessionCode(sessionCode);
        req.user = {
            userId: userData.userId,
            email: userData.email,
            role: userData.role
        };
        next();
    }
    catch (error) {
        console.error('Session code validation error:', error);
        res.status(401).json({ message: 'Not authorized, invalid token' });
        return;
    }
};
exports.protect = protect;
const checkRole = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        res.status(403).json({ message: 'Forbidden: You do not have the required role.' });
        return;
    }
    next();
};
exports.checkRole = checkRole;
//# sourceMappingURL=auth.middleware.js.map