import { Request, Response } from 'express';
import cloudinary from '../../config/cloudinary-config';
import dotenv from "dotenv";
import { UploadedFile } from 'express-fileupload';
import { File, FileStatus } from "../../entities/file.entity";
import { User } from "../../entities/users.entity";
import dataSource from '../../data-source';
import request from 'request'



dotenv.config();

export const uploadService = async (req: Request, res: Response) => {
    const file = req.files?.file as UploadedFile;

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
        });

        const user = (req as any).user
        const userModel = await dataSource.getRepository(User).findOneBy({
            id: user.userId,
        } as object)

        const fileData = {
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.mimetype,
            userId: user.userId as number,
            publicId: result.public_id,
            url: result.secure_url,
            user: userModel
        };
          
        const fileEntity = dataSource.getRepository(File).create(fileData as object)
        await dataSource.getRepository(File).save(fileEntity)

        return res.status(200).send({
            public_id: result.public_id,
            url: result.secure_url,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Could not upload file.' });
    }
};

export const downloadService = async (req: Request, res: Response) => {
    const { fileId } = req.params;

    try {
        const result = await cloudinary.api.resource(fileId);
        const publicUrl = result.secure_url;

        return res.redirect(publicUrl);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Could not retrieve the file.' });
    }
};

export const markAsUnsafeAndDeleteService = async (req: Request, res: Response)  => {
    const { fileId } = req.params;
    const adminId = (req as any).user.userId

    try {
        const file = await dataSource.getRepository(File).findOne({
            where: { publicId: fileId, deleted_at: null },
        }  as object);

        if (!file)
            return res.status(400).json({ message: "File not found" });

        file.markedBy = file.markedBy || [];

        if (!file.markedBy.includes(adminId)) {
            file.markedBy.push(adminId);
            file.status = FileStatus.UNSAFE; 
            await dataSource.getRepository(File).save(file);
        }

        const unSafeCount = file.markedBy.length; 
        
        if(unSafeCount == 3) {
            file.softDelete()
            await dataSource.getRepository(File).save(file);

            cloudinary.uploader.destroy(fileId, (error, result) => {
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
        console.error(error);
        return res.status(500).json({ error: 'Could not mark as unsafe and delete the file.' });
    }
}

export const getAllUploadsService = async (req: Request, res: Response)  => {

    try {
        const files = await dataSource.getRepository(File).find({ where : { status: FileStatus.SAFE }} )
        return res.status(200).json({ message: 'All Files fetched', files });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Could not fetch files.' });
    }
}

export const getUserFileHistoryService = async (req: Request, res: Response)  => {
    const user = (req as any).user;
    try {
        const userModel = await dataSource.getRepository(User).findOneBy({
            id: user.userId,
        } as object)

        if(!userModel)
            return res.status(400).json({ message: "User Not found" });


        const files = await dataSource.getRepository(File).find({ where: { user: userModel }} as object)
        return res.status(200).json({ message: 'All Files fetched', files });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Could not fetch files.' });
    }
}

export const streamVideoAndAudioService = async (req: Request, res: Response)  => {
    const { fileId } = req.params;
    try {
        const file = await dataSource.getRepository(File).findOne({ where: { publicId: fileId }} as object)

        if(file?.userId != (req as any).user.userId)
            return res.status(403).json({ message: 'You are not authorized to stream this media'});

        // Set the appropriate headers for media streaming
        res.setHeader('Content-Type', file?.mimeType as string);

        // Stream the media from the Cloudinary URL
        request.get(file?.url as string).pipe(res);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Could not stream media.' });
    }
}
