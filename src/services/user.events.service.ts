import { kafkaService } from './kafka.service';
import { 
  KafkaTopics, 
  KafkaEvent,
  UserCreatedEvent,
  UserUpdatedEvent,
  UserDeletedEvent,
  UserVerifiedEvent,
  UserPasswordResetEvent,
  UserProfileCompletedEvent,
  UserLoginEvent,
  UserLogoutEvent,
} from '../types/kafka.events';
import { log } from '../config/logger';
import { randomUUID } from 'crypto';

/**
 * UserEventsProducer - Helper class for publishing user-related events to Kafka
 * 
 * This class provides convenient methods for publishing various user events
 * with proper event structure and error handling.
 */
class UserEventsProducer {
  private readonly SERVICE_NAME = 'user-service';
  private readonly EVENT_VERSION = '1.0.0';

  /**
   * Create a base event structure
   */
  private createBaseEvent<T extends KafkaEvent['eventType']>(eventType: T) {
    return {
      eventId: randomUUID(),
      eventType,
      timestamp: new Date().toISOString(),
      service: this.SERVICE_NAME,
      version: this.EVENT_VERSION,
    };
  }

  /**
   * Publish user created event
   */
  async publishUserCreated(
    userId: string,
    email: string,
    role: 'Student' | 'Teacher' | 'Admin',
    fullName?: string
  ): Promise<void> {
    try {
      const event: UserCreatedEvent = {
        ...this.createBaseEvent('USER_CREATED'),
        eventType: 'USER_CREATED',
        data: {
          userId,
          email,
          role,
          fullName,
          createdAt: new Date().toISOString(),
        },
      };

      await kafkaService.publish(KafkaTopics.USER_CREATED, event, userId);
      
      log.info('User created event published', {
        userId,
        email,
        role,
      });
    } catch (error) {
      log.error('Failed to publish user created event', {
        userId,
        email,
        error,
      });
      // Don't throw - events are fire-and-forget
    }
  }

  /**
   * Publish user updated event
   */
  async publishUserUpdated(
    userId: string,
    email: string,
    updatedFields: string[]
  ): Promise<void> {
    try {
      const event: UserUpdatedEvent = {
        ...this.createBaseEvent('USER_UPDATED'),
        eventType: 'USER_UPDATED',
        data: {
          userId,
          email,
          updatedFields,
          updatedAt: new Date().toISOString(),
        },
      };

      await kafkaService.publish(KafkaTopics.USER_UPDATED, event, userId);
      
      log.info('User updated event published', {
        userId,
        email,
        updatedFields,
      });
    } catch (error) {
      log.error('Failed to publish user updated event', {
        userId,
        email,
        error,
      });
    }
  }

  /**
   * Publish user deleted event
   */
  async publishUserDeleted(userId: string, email: string): Promise<void> {
    try {
      const event: UserDeletedEvent = {
        ...this.createBaseEvent('USER_DELETED'),
        eventType: 'USER_DELETED',
        data: {
          userId,
          email,
          deletedAt: new Date().toISOString(),
        },
      };

      await kafkaService.publish(KafkaTopics.USER_DELETED, event, userId);
      
      log.info('User deleted event published', {
        userId,
        email,
      });
    } catch (error) {
      log.error('Failed to publish user deleted event', {
        userId,
        email,
        error,
      });
    }
  }

  /**
   * Publish user verified event
   */
  async publishUserVerified(userId: string, email: string): Promise<void> {
    try {
      const event: UserVerifiedEvent = {
        ...this.createBaseEvent('USER_VERIFIED'),
        eventType: 'USER_VERIFIED',
        data: {
          userId,
          email,
          verifiedAt: new Date().toISOString(),
        },
      };

      await kafkaService.publish(KafkaTopics.USER_VERIFIED, event, userId);
      
      log.info('User verified event published', {
        userId,
        email,
      });
    } catch (error) {
      log.error('Failed to publish user verified event', {
        userId,
        email,
        error,
      });
    }
  }

  /**
   * Publish user password reset event
   */
  async publishUserPasswordReset(userId: string, email: string): Promise<void> {
    try {
      const event: UserPasswordResetEvent = {
        ...this.createBaseEvent('USER_PASSWORD_RESET'),
        eventType: 'USER_PASSWORD_RESET',
        data: {
          userId,
          email,
          resetAt: new Date().toISOString(),
        },
      };

      await kafkaService.publish(KafkaTopics.USER_PASSWORD_RESET, event, userId);
      
      log.info('User password reset event published', {
        userId,
        email,
      });
    } catch (error) {
      log.error('Failed to publish user password reset event', {
        userId,
        email,
        error,
      });
    }
  }

  /**
   * Publish user profile completed event
   */
  async publishUserProfileCompleted(
    userId: string,
    email: string,
    role: 'Student' | 'Teacher' | 'Admin'
  ): Promise<void> {
    try {
      const event: UserProfileCompletedEvent = {
        ...this.createBaseEvent('USER_PROFILE_COMPLETED'),
        eventType: 'USER_PROFILE_COMPLETED',
        data: {
          userId,
          email,
          role,
          completedAt: new Date().toISOString(),
        },
      };

      await kafkaService.publish(KafkaTopics.USER_PROFILE_COMPLETED, event, userId);
      
      log.info('User profile completed event published', {
        userId,
        email,
        role,
      });
    } catch (error) {
      log.error('Failed to publish user profile completed event', {
        userId,
        email,
        error,
      });
    }
  }

  /**
   * Publish user login event
   */
  async publishUserLogin(
    userId: string,
    email: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const event: UserLoginEvent = {
        ...this.createBaseEvent('USER_LOGIN'),
        eventType: 'USER_LOGIN',
        data: {
          userId,
          email,
          ipAddress,
          userAgent,
          loginAt: new Date().toISOString(),
        },
      };

      await kafkaService.publish(KafkaTopics.USER_LOGIN, event, userId);
      
      log.info('User login event published', {
        userId,
        email,
      });
    } catch (error) {
      log.error('Failed to publish user login event', {
        userId,
        email,
        error,
      });
    }
  }

  /**
   * Publish user logout event
   */
  async publishUserLogout(userId: string, email: string): Promise<void> {
    try {
      const event: UserLogoutEvent = {
        ...this.createBaseEvent('USER_LOGOUT'),
        eventType: 'USER_LOGOUT',
        data: {
          userId,
          email,
          logoutAt: new Date().toISOString(),
        },
      };

      await kafkaService.publish(KafkaTopics.USER_LOGOUT, event, userId);
      
      log.info('User logout event published', {
        userId,
        email,
      });
    } catch (error) {
      log.error('Failed to publish user logout event', {
        userId,
        email,
        error,
      });
    }
  }
}

// Export singleton instance
export const userEventsProducer = new UserEventsProducer();
