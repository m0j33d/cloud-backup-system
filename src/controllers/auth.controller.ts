import { Request, Response } from 'express';
import { loginService, registerService } from '../services/auth/auth.service'

export const login = async (req: Request, res: Response) => {
    await loginService(req, res);
};

export const register = async (req: Request, res: Response) => {
    await registerService(req, res);
};