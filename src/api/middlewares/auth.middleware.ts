import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import { SecretCodeService } from '../../services/secretCode.service';
import { log } from '../../config/logger';

export const protect = (req: Request, res: Response, next: NextFunction): void => {
  let sessionCode: string | undefined;

  // Check for session code in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    sessionCode = req.headers.authorization.split(' ')[1];
  }

  // Check for session code in cookies (both sessionCode and accessToken)
  if (!sessionCode && req.cookies.sessionCode) {
    sessionCode = req.cookies.sessionCode;
  }

  if (!sessionCode && req.cookies.accessToken) {
    sessionCode = req.cookies.accessToken;
  }

  if (!sessionCode) {
    log.security('Authentication failed - no token provided', {
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
      userAgent: req.get('User-Agent')
    });
    res.status(401).json({ message: 'Not authorized, no token provided' });
    return;
  }

  try {
    // Validate the session code
    const userData = SecretCodeService.validateSessionCode(sessionCode);
    
    log.debug('Authentication successful', {
      userId: userData.userId,
      email: userData.email,
      role: userData.role,
      ip: req.ip,
      url: req.originalUrl
    });
    
    // Add user data to request
    (req as AuthenticatedRequest).user = {
      userId: userData.userId,
      email: userData.email,
      role: userData.role as 'Student' | 'Teacher' | 'Admin'
    };
    
    next();
  } catch (error) {
    log.security('Authentication failed - invalid token', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
      userAgent: req.get('User-Agent')
    });
    res.status(401).json({ message: 'Not authorized, invalid token' });
    return;
  }
};

export const checkRole = (roles: ('Student' | 'Teacher' | 'Admin')[]) => 
  (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!roles.includes(req.user.role)) {
      log.security('Access denied - insufficient role', {
        userId: req.user.userId,
        userRole: req.user.role,
        requiredRoles: roles,
        ip: req.ip,
        url: req.originalUrl,
        method: req.method
      });
      res.status(403).json({ message: 'Forbidden: You do not have the required role.' });
      return;
    }
    
    log.debug('Role check passed', {
      userId: req.user.userId,
      userRole: req.user.role,
      requiredRoles: roles,
      url: req.originalUrl
    });
    
    next();
  }; 