import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../types';
export declare const getTeacherProfile: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateProfessionalDetails: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getAllTeachers: (req: Request, res: Response) => Promise<void>;
export declare const getTeachersByQualification: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=teacher.controller.d.ts.map