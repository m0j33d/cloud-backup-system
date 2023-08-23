import express from "express";

import {
    upload,
    download,
    createFolder
} from '../controllers/file.controller'
import authenticate from '../middleware/authenticate'
import { registerValidation, loginValidation, validate } from "../validations/validate"


const fileRouter = express.Router();

fileRouter.post("/upload", upload);
fileRouter.post("/create-folder", createFolder);
fileRouter.get("/download/:fileId",  download);


export default fileRouter;
