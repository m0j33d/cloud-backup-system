import { Request, Response } from 'express';
import  cloudinary from '../../config/cloudinary-config';
import dotenv from "dotenv";
import { UploadedFile } from 'express-fileupload';


dotenv.config();

export const uploadService = async (req: Request, res: Response) => {
   const file = req.files?.file as UploadedFile;
 
   try {
        if (!file) {
            return res.status(400).json({ error: "No File Selected" });
        }

        const result = await cloudinary.uploader.upload(`${file.tempFilePath}`, {
            public_id: `${Date.now()}`,
            resource_type: "auto",
        });
    
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
  