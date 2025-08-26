import prisma from '../config/prisma';

export class CleanupService {
  /**
   * Remove expired verification codes from the database
   */
  static async cleanupExpiredVerificationCodes(): Promise<number> {
    try {
      const result = await prisma.user.updateMany({
        where: {
          verificationExpires: {
            lt: new Date(), // Less than current time (expired)
          },
          isVerified: false,
        },
        data: {
          verificationCode: null,
          verificationExpires: null,
        },
      });

      console.log(`Cleaned up ${result.count} expired verification codes`);
      return result.count;
    } catch (error) {
      console.error('Error cleaning up expired verification codes:', error);
      throw error;
    }
  }

  /**
   * Remove expired password reset codes from the database
   */
  static async cleanupExpiredPasswordResetCodes(): Promise<number> {
    try {
      const result = await prisma.user.updateMany({
        where: {
          passwordResetExpires: {
            lt: new Date(), // Less than current time (expired)
          },
        },
        data: {
          passwordResetCode: null,
          passwordResetExpires: null,
        },
      });

      console.log(`Cleaned up ${result.count} expired password reset codes`);
      return result.count;
    } catch (error) {
      console.error('Error cleaning up expired password reset codes:', error);
      throw error;
    }
  }

  /**
   * Run all cleanup tasks
   */
  static async runAllCleanupTasks(): Promise<void> {
    console.log('Starting cleanup tasks...');
    
    try {
      await this.cleanupExpiredVerificationCodes();
      await this.cleanupExpiredPasswordResetCodes();
      console.log('All cleanup tasks completed successfully');
    } catch (error) {
      console.error('Error running cleanup tasks:', error);
    }
  }
}
