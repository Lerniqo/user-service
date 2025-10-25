/**
 * Kafka Event Types for User Service
 * 
 * This file contains type definitions for all Kafka events
 * produced and consumed by the user service.
 */

// Kafka Topics
export enum KafkaTopics {
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_VERIFIED = 'user.verified',
  USER_PASSWORD_RESET = 'user.password.reset',
  USER_PROFILE_COMPLETED = 'user.profile.completed',
  USER_LOGIN = 'user.login',
  USER_LOGOUT = 'user.logout',
}

// Base Event Interface
export interface BaseKafkaEvent {
  eventId: string;
  eventType: string;
  timestamp: string;
  service: string;
  version: string;
}

// User Created Event
export interface UserCreatedEvent extends BaseKafkaEvent {
  eventType: 'USER_CREATED';
  data: {
    userId: string;
    email: string;
    role: 'Student' | 'Teacher' | 'Admin';
    fullName?: string;
    createdAt: string;
  };
}

// User Updated Event
export interface UserUpdatedEvent extends BaseKafkaEvent {
  eventType: 'USER_UPDATED';
  data: {
    userId: string;
    email: string;
    updatedFields: string[];
    updatedAt: string;
  };
}

// User Deleted Event
export interface UserDeletedEvent extends BaseKafkaEvent {
  eventType: 'USER_DELETED';
  data: {
    userId: string;
    email: string;
    deletedAt: string;
  };
}

// User Verified Event
export interface UserVerifiedEvent extends BaseKafkaEvent {
  eventType: 'USER_VERIFIED';
  data: {
    userId: string;
    email: string;
    verifiedAt: string;
  };
}

// User Password Reset Event
export interface UserPasswordResetEvent extends BaseKafkaEvent {
  eventType: 'USER_PASSWORD_RESET';
  data: {
    userId: string;
    email: string;
    resetAt: string;
  };
}

// User Profile Completed Event
export interface UserProfileCompletedEvent extends BaseKafkaEvent {
  eventType: 'USER_PROFILE_COMPLETED';
  data: {
    userId: string;
    email: string;
    role: 'Student' | 'Teacher' | 'Admin';
    completedAt: string;
  };
}

// User Login Event
export interface UserLoginEvent extends BaseKafkaEvent {
  eventType: 'USER_LOGIN';
  data: {
    userId: string;
    email: string;
    ipAddress?: string;
    userAgent?: string;
    loginAt: string;
  };
}

// User Logout Event
export interface UserLogoutEvent extends BaseKafkaEvent {
  eventType: 'USER_LOGOUT';
  data: {
    userId: string;
    email: string;
    logoutAt: string;
  };
}

// Union type of all events
export type KafkaEvent =
  | UserCreatedEvent
  | UserUpdatedEvent
  | UserDeletedEvent
  | UserVerifiedEvent
  | UserPasswordResetEvent
  | UserProfileCompletedEvent
  | UserLoginEvent
  | UserLogoutEvent;
