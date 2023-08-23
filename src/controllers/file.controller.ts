import { Request, Response } from 'express';
import { uploadService, downloadService, createFolderService } from '../services/file/file.service'

export const upload = async (req: Request, res: Response) => {
    await uploadService(req, res);
};

export const download = async (req: Request, res: Response) => {
    await downloadService(req, res);
};

export const createFolder = async (req: Request, res: Response) => {
    await createFolderService(req, res);
};