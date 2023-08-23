import express from "express";

import {
    upload,
    download,
    createFolder,
    markAsUnsafeAndDelete,
    getAllUploads,
    streamMedia
} from '../controllers/file.controller'

import { isAdminMiddleware } from '../middleware/admin'

const fileRouter = express.Router();

fileRouter.post("/upload", upload);
fileRouter.post("/create-folder", createFolder);
fileRouter.get("/download/:fileId",  download);
fileRouter.get("/stream/:fileId", streamMedia)


fileRouter.put("/status/:fileId", isAdminMiddleware, markAsUnsafeAndDelete)
fileRouter.get("/uploads", isAdminMiddleware, getAllUploads)

export default fileRouter;
