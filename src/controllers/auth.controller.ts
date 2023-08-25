import { Request, Response } from 'express';
import { loginService, registerService, revokeUserSessionService } from '../services/auth.service'

export const login = async (req: Request, res: Response) => {
    await loginService(req, res);
};

export const register = async (req: Request, res: Response) => {
    await registerService(req, res);
};

export const revokeUserSession = async (req: Request, res: Response) => {
    await revokeUserSessionService(req, res);
};