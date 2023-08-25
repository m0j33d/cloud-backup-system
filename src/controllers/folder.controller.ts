import { Request, Response } from 'express';
import { 
    createFolderService,
 } from '../services/folder.service'


export const createFolder = async (req: Request, res: Response) => {
    await createFolderService(req, res);
};
