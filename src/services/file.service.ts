import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import dotenv from "dotenv";
import { UploadedFile } from 'express-fileupload';
import { File, FileStatus } from "../entities/file.entity";
import { Folder } from "../entities/folder.entity";
import { User } from "../entities/users.entity";
import dataSource from '../data-source';
import request from 'request'
import { classToPlain } from 'class-transformer';


dotenv.config();
const userRepository = dataSource.getRepository(User);
const fileRepository = dataSource.getRepository(File);
const folderRepository = dataSource.getRepository(Folder);

export const uploadService = async (req: Request, res: Response) => {
    const file = req.files?.file as UploadedFile;
    const { compress } = req.query;
    const { folderSlug } = req.body;

    const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024; // 200 MB

    try {
        if (!file) {
            return res.status(400).json({ message: "No File Selected" });
        }

        // Check the file size
        if (file.size > MAX_FILE_SIZE_BYTES) {
            return res.status(400).json({ message: 'File size exceeds the maximum allowed limit' });
        }

        const result = await cloudinary.uploader.upload(`${file.tempFilePath}`, {
            public_id: `${Date.now()}`,
            resource_type: "auto",
            quality: compress ? 'auto:low' : 'auto'
        });

        const user = (req as any).user
        const userModel = await userRepository.findOneBy({
            id: user.userId,
        } as object)

        let folder = null;
        if (folderSlug) {
            folder = await folderRepository.findOne({ where: { slug: folderSlug } } as object)
        }

        const fileData = {
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.mimetype,
            userId: user?.userId as number,
            fileSlug: result.public_id,
            url: result.secure_url,
            user: userModel,
            folder: folder
        };

        const fileEntity = fileRepository.create(fileData as object)
        const fileResult = await fileRepository.save(fileEntity)

        return res.status(200).json({ message: "File uploaded Succesfully", file: fileResult });
    } catch (error) {
        return res.status(500).json({ error: 'Could not upload file.' });
    }
};

export const downloadService = async (req: Request, res: Response) => {
    const { fileSlug } = req.params;

    try {
        const file = await fileRepository.findOne({ where: { fileSlug: fileSlug } } as object)

        if (!file)
            return res.status(400).json({ message: 'File not found' });


        if (file.userId != (req as any).user.userId)
            return res.status(403).json({ message: 'You are not authorized to download this media' });

        const result = await cloudinary.api.resource(fileSlug);
        const publicUrl = result.secure_url;

        return res.redirect(publicUrl);

    } catch (error) {
        return res.status(500).json({ error: 'Could not retrieve the file.' });
    }
};

export const markAsUnsafeAndDeleteService = async (req: Request, res: Response) => {
    const { fileSlug } = req.params;
    const adminId = (req as any).user.userId

    try {
        const file = await fileRepository.findOne({
            where: { fileSlug: fileSlug, deleted_at: null },
        } as object);

        if (!file)
            return res.status(400).json({ message: "File not found" });

        file.markedBy = file.markedBy || [];

        if (!file.markedBy.includes(adminId)) {
            file.markedBy.push(adminId);
            file.status = FileStatus.UNSAFE;
            await fileRepository.save(file);
        }

        const unSafeCount = file.markedBy.length;

        if (unSafeCount > 3)
            return res.status(200).json({ message: 'File has already been deleted' });


        if (unSafeCount >= 3) {
            file.softDelete()
            await fileRepository.save(file);

            cloudinary.uploader.destroy(fileSlug, (error, result) => {
                if (error) {
                    throw new Error(error)
                }
            });
            return res.status(200).json({ message: 'File marked as unsafe and deleted successfully' });
        }

        return res.status(200).json({
            message: `File marked as unsafe successfully. Waiting for ${3 - unSafeCount} admins(s) before deleting file`
        });


    } catch (error) {
        return res.status(500).json({ error: 'Could not mark as unsafe and delete the file.' });
    }
}

export const getAllUploadsService = async (req: Request, res: Response) => {
    const { page, perPage, status } = req.query;

    const pageNumber = typeof page === 'string' ? parseInt(page) : undefined;
    const recordsPerPage = typeof perPage === 'string' ? parseInt(perPage) : undefined;

    let condition = {} as any;
    if (status) condition.status = status

    try {

        const files = await fileRepository.find({
            where: condition,
            relations: ['folder', 'user'],
            skip: pageNumber && recordsPerPage ? (pageNumber - 1) * recordsPerPage : 0,
            take: recordsPerPage ?? 10,
        })

        const filesWithoutPassword = classToPlain(files);

        return res.status(200).json({ message: 'All Users files fetched', files: filesWithoutPassword });

    } catch (error) {
        return res.status(500).json({ error: 'Could not fetch files.' });
    }
}

export const getUserFileHistoryService = async (req: Request, res: Response) => {
    const { page, perPage, status } = req.query;
    const user = (req as any).user;

    const pageNumber = typeof page === 'string' ? parseInt(page) : undefined;
    const recordsPerPage = typeof perPage === 'string' ? parseInt(perPage) : undefined;


    try {
        const userModel = await userRepository.findOneBy({
            id: user.userId,
        } as object)

        if (!userModel)
            return res.status(400).json({ message: "User Not found" });

        let condition = {} as any;
        if (status) condition.status = status
        condition.user = userModel

        const files = await fileRepository.find({
            where: condition,
            relations: ['folder'],
            skip: pageNumber && recordsPerPage ? (pageNumber - 1) * recordsPerPage : 0,
            take: recordsPerPage ?? 10,
        } as object)

        return res.status(200).json({ message: 'All Files fetched', files });

    } catch (error) {
        return res.status(500).json({ error: 'Could not fetch files.' });
    }
}

export const streamVideoAndAudioService = async (req: Request, res: Response) => {
    const { fileSlug } = req.params;
    try {
        const file = await fileRepository.findOne({ where: { fileSlug: fileSlug } } as object)

        if (!file)
            return res.status(400).json({ message: 'File not found' });

        if (file.userId != (req as any).user.userId)
            return res.status(403).json({ message: 'You are not authorized to stream this media' });

        // Set the appropriate headers for media streaming
        res.setHeader('Content-Type', file.mimeType as string);

        // Stream the media from the Cloudinary URL
        request.get(file.url as string).pipe(res);

    } catch (error) {
        return res.status(500).json({ error: 'Could not stream media.' });
    }
}


export const getSingleUploadService = async (req: Request, res: Response) => {
    const { fileSlug } = req.params;
    try {
        const file = await fileRepository.findOne({ where: { fileSlug: fileSlug, deleted_at: null }, relations: ['folder', 'user'] } as object)

        if (!file)
            return res.status(400).json({ message: 'File not found' });

        const fileWithoutPassword = classToPlain(file);

        return res.status(200).json({ message: "File retrieved", file: fileWithoutPassword })

    } catch (error) {
        return res.status(500).json({ error: 'Could not fetch file.' });
    }
}

