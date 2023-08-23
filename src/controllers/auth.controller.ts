import { Request, Response } from 'express';
import loginService from '../services/auth/loginService'
import registerService from '../services/auth/registerService'

export const login = async (req: Request, res: Response) => {
    await loginService(req, res);
};

export const register = async (req: Request, res: Response) => {
    await registerService(req, res);
};