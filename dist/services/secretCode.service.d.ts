export declare class SecretCodeService {
    private static readonly SECRET_KEY;
    private static readonly ALGORITHM;
    private static readonly IV_LENGTH;
    static encode(data: {
        userId: string;
        email: string;
        role: string;
        timestamp: number;
    }): string;
    static decode(secretCode: string): {
        userId: string;
        email: string;
        role: string;
        timestamp: number;
    };
    static generateVerificationCode(): string;
    static generatePasswordResetCode(): string;
    static generateSessionCode(userId: string, email: string, role: string): string;
    static validateSessionCode(sessionCode: string): {
        userId: string;
        email: string;
        role: string;
    };
}
//# sourceMappingURL=secretCode.service.d.ts.map