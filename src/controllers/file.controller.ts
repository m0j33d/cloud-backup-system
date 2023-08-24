import { Request, Response } from 'express';
import { 
    uploadService, 
    downloadService, 
    markAsUnsafeAndDeleteService,
    getAllUploadsService,
    streamVideoAndAudioService,
    getUserFileHistoryService
 } from '../services/file/file.service'

export const upload = async (req: Request, res: Response) => {
    await uploadService(req, res);
};

export const download = async (req: Request, res: Response) => {
    await downloadService(req, res);
};

export const markAsUnsafeAndDelete = async (req: Request, res: Response) => {
    await markAsUnsafeAndDeleteService(req, res);
};

export const getAllUploads = async (req: Request, res: Response) => {
    await getAllUploadsService(req, res);
};

export const streamMedia = async (req: Request, res: Response) => {
    await streamVideoAndAudioService(req, res);
};

export const getUserFileHistory = async (req: Request, res: Response) => {
    await getUserFileHistoryService(req, res);
};