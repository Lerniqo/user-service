import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../types';
export declare const register: (req: Request, res: Response) => Promise<void>;
export declare const verifyEmail: (req: Request, res: Response) => Promise<void>;
export declare const completeProfile: (req: Request, res: Response) => Promise<void>;
export declare const login: (req: Request, res: Response) => Promise<void>;
export declare const refreshToken: (req: Request, res: Response) => Promise<void>;
export declare const logout: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getMyProfile: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateMyProfile: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const deleteMyAccount: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getAllTeachers: (req: Request, res: Response) => Promise<void>;
export declare const getTeacherById: (req: Request, res: Response) => Promise<void>;
export declare const getStudentById: (req: Request, res: Response) => Promise<void>;
export declare const getAllUsers: (req: Request, res: Response) => Promise<void>;
export declare const updateUserById: (req: Request, res: Response) => Promise<void>;
export declare const changePassword: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const uploadProfilePhoto: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=users.controller.d.ts.map