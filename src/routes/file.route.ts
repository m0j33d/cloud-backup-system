import express from "express";

import {
    upload,
    download,
    markAsUnsafeAndDelete,
    getAllUploads,
    streamMedia,
    getUserFileHistory
} from '../controllers/file.controller'

import { isAdminMiddleware } from '../middleware/admin'

const fileRouter = express.Router();

fileRouter.post("/upload", upload);
fileRouter.get("/download/:fileId",  download);
fileRouter.get("/stream/:fileId", streamMedia);
fileRouter.get("/history", getUserFileHistory);


fileRouter.put("/status/:fileId", isAdminMiddleware, markAsUnsafeAndDelete)
fileRouter.get("/uploads", isAdminMiddleware, getAllUploads)

export default fileRouter;
