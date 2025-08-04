import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';

// Middleware to verify JWT
export const protect = (req: Request, res: Response, next: NextFunction): void => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env['JWT_SECRET']!) as {
        userId: string;
        email: string;
        role: 'STUDENT' | 'TEACHER' | 'ADMIN';
      };

      // Attach user to the request object
      (req as AuthenticatedRequest).user = decoded;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
    return;
  }
};

// Middleware to check for specific roles
export const checkRole = (roles: ('STUDENT' | 'TEACHER' | 'ADMIN')[]) => 
  (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden: You do not have the required role.' });
      return;
    }
    next();
  }; 