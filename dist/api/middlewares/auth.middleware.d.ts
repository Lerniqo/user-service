import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
export declare const protect: (req: Request, res: Response, next: NextFunction) => void;
export declare const checkRole: (roles: ("Student" | "Teacher" | "Admin")[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map