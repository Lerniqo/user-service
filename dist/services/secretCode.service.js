"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecretCodeService = void 0;
const crypto_1 = __importDefault(require("crypto"));
class SecretCodeService {
    static encode(data) {
        try {
            const jsonString = JSON.stringify(data);
            const iv = crypto_1.default.randomBytes(this.IV_LENGTH);
            const key = crypto_1.default.scryptSync(this.SECRET_KEY, 'salt', 32);
            const cipher = crypto_1.default.createCipheriv(this.ALGORITHM, key, iv);
            let encrypted = cipher.update(jsonString, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            const result = iv.toString('hex') + ':' + encrypted;
            return Buffer.from(result).toString('base64');
        }
        catch (error) {
            console.error('Error encoding secret code:', error);
            throw new Error('Failed to encode secret code');
        }
    }
    static decode(secretCode) {
        try {
            const encryptedData = Buffer.from(secretCode, 'base64').toString('utf8');
            const [ivHex, encrypted] = encryptedData.split(':');
            if (!ivHex || !encrypted) {
                throw new Error('Invalid secret code format');
            }
            const iv = Buffer.from(ivHex, 'hex');
            const key = crypto_1.default.scryptSync(this.SECRET_KEY, 'salt', 32);
            const decipher = crypto_1.default.createDecipheriv(this.ALGORITHM, key, iv);
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            const data = JSON.parse(decrypted);
            if (!data.userId || !data.email || !data.role || !data.timestamp) {
                throw new Error('Invalid secret code data');
            }
            const now = Date.now();
            const codeAge = now - data.timestamp;
            const maxAge = 24 * 60 * 60 * 1000;
            if (codeAge > maxAge) {
                throw new Error('Secret code has expired');
            }
            return data;
        }
        catch (error) {
            console.error('Error decoding secret code:', error);
            throw new Error('Invalid or expired secret code');
        }
    }
    static generateVerificationCode() {
        return crypto_1.default.randomBytes(32).toString('hex');
    }
    static generatePasswordResetCode() {
        return crypto_1.default.randomBytes(16).toString('hex');
    }
    static generateSessionCode(userId, email, role) {
        const data = {
            userId,
            email,
            role,
            timestamp: Date.now()
        };
        return this.encode(data);
    }
    static validateSessionCode(sessionCode) {
        try {
            const data = this.decode(sessionCode);
            return {
                userId: data.userId,
                email: data.email,
                role: data.role
            };
        }
        catch (error) {
            throw new Error('Invalid session code');
        }
    }
}
exports.SecretCodeService = SecretCodeService;
SecretCodeService.SECRET_KEY = process.env.SECRET_KEY || 'your-super-secret-key-change-this-in-production';
SecretCodeService.ALGORITHM = 'aes-256-cbc';
SecretCodeService.IV_LENGTH = 16;
//# sourceMappingURL=secretCode.service.js.map