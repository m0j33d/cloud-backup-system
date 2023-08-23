import { Request, Response } from 'express';
import cloudinary from '../../config/cloudinary-config';
import dotenv from "dotenv";
import { UploadedFile } from 'express-fileupload';
import { File, FileStatus } from "../../entities/file.entity";
import dataSource from '../../data-source'


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

        const fileData = {
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.mimetype,
            userId: user.userId as number,
            publicId: result.public_id,
            url: result.secure_url
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

export const createFolderService = async (req: Request, res: Response) => {
    const { folderName } = req.body;

    try {
        const folder = await cloudinary.api.create_folder(folderName);

        return res.status(201).json({ message: 'Folder created successfully', folder });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Could not create the folder.' });
    }
};

export const markAsUnsafeAndDeleteService = async (req: Request, res: Response)  => {
    const { fileId } = req.params;

    try {
        const file = await dataSource.getRepository(File).findOneBy({
            publicId: fileId,
        })

        if (!file)
            return res.status(400).json({ message: "File not found" });

        file.status = FileStatus.UNSAFE; 
        file.softDelete()
        await dataSource.getRepository(File).save(file);


        cloudinary.uploader.destroy(fileId, (error, result) => {
            if (error) {
                throw new Error(error)
            }
        });
      
        return res.status(200).json({ message: 'File marked as unsafe and deleted successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Could not mark as unsafe and delete the file.' });
    }
}

export const getAllUploadsService = async (req: Request, res: Response)  => {

    try {
        const files = await dataSource.getRepository(File).find()
        return res.status(200).json({ message: 'All Files fetched', files });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Could not fetch files.' });
    }
}

export const streamVideoAndAudioService = async (req: Request, res: Response)  => {
    const { fileId } = req.params;
    try {
        
            //middlware to check owner of file
        // const stream = cloudinary.api.resource_stream(fileId, {
        //     resource_type: 'video' // or 'audio' depending on your use case
        // });
          
        // res.setHeader('Content-Type', 'video/mp4');
        // stream.pipe(res);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Could not fetch files.' });
    }
}
