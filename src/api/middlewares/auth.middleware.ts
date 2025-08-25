import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import { SecretCodeService } from '../../services/secretCode.service';

export const protect = (req: Request, res: Response, next: NextFunction): void => {
  let sessionCode: string | undefined;

  // Check for session code in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    sessionCode = req.headers.authorization.split(' ')[1];
  }

  // Check for session code in cookies
  if (!sessionCode && req.cookies.sessionCode) {
    sessionCode = req.cookies.sessionCode;
  }

  if (!sessionCode) {
    res.status(401).json({ message: 'Not authorized, no session code provided' });
    return;
  }

  try {
    // Validate the session code
    const userData = SecretCodeService.validateSessionCode(sessionCode);
    
    // Add user data to request
    (req as AuthenticatedRequest).user = {
      userId: userData.userId,
      email: userData.email,
      role: userData.role as 'Student' | 'Teacher' | 'Admin'
    };
    
    next();
  } catch (error) {
    console.error('Session code validation error:', error);
    res.status(401).json({ message: 'Not authorized, invalid session code' });
    return;
  }
};

export const checkRole = (roles: ('Student' | 'Teacher' | 'Admin')[]) => 
  (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden: You do not have the required role.' });
      return;
    }
    next();
  }; 