import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../types';
export declare const getAdminProfile: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateAdministrativeDetails: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getAllAdmins: (req: Request, res: Response) => Promise<void>;
export declare const getSystemStatistics: (req: Request, res: Response) => Promise<void>;
export declare const getUsersByRole: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=admin.controller.d.ts.map