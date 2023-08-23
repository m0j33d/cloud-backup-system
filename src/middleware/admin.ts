import { Request, Response, NextFunction } from 'express';
import dataSource from '../data-source';
import {User} from '../entities/users.entity';

export const isAdminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  const userModel = await dataSource.getRepository(User).findOneBy({
        id: user.userId,
    } as object)

  if (!userModel || userModel?.userType !== 'admin') {
    return res.status(403).json({ message: 'Access denied. You must be an admin to access this resource.' });
  }

  next();
};