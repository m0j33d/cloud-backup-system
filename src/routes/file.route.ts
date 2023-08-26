import express from "express";

import {
    upload,
    download,
    streamMedia,
    getUserFileHistory
} from '../controllers/file.controller'


const fileRouter = express.Router();

fileRouter.post("/upload", upload);
fileRouter.get("/download/:fileSlug",  download);
fileRouter.get("/stream/:fileSlug", streamMedia);
fileRouter.get("/history", getUserFileHistory);

export default fileRouter;
