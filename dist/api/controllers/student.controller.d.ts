import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../types';
export declare const getStudentProfile: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateAcademicDetails: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getAllStudents: (req: Request, res: Response) => Promise<void>;
export declare const getStudentsByDepartment: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=student.controller.d.ts.map