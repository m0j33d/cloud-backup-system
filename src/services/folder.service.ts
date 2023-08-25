import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import dotenv from "dotenv";
import { Folder } from "../entities/folder.entity";
import { User } from "../entities/users.entity";
import { File } from "../entities/file.entity";
import dataSource from '../data-source'
import generateSlug from '../utils/generateSlug';
import { NotFoundException } from '../exceptions/NotFountException';
import { UnauthorizedException } from '../exceptions/UnauthorizedException';


dotenv.config();

const folderRepository = dataSource.getRepository(Folder);

export const createFolderService = async (req: Request, res: Response) => {
    const { folderName } = req.body;

    try {
        const folder = await cloudinary.api.create_folder(folderName);

        const user = (req as any).user

        const folderData = {
            folderName: folderName,
            slug: generateSlug(folderName),
            user: user.userId as number,
        };
          
        const folderEntity = folderRepository.create(folderData as object)
        await folderRepository.save(folderEntity)

        return res.status(201).json({ message: 'Folder created', folder });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Could not create the folder.' });
    }
};

