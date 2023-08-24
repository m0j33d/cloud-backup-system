import express from "express";

import {
    createFolder,
} from '../controllers/folder.controller'

const folderRouter = express.Router();

folderRouter.post("/create-folder", createFolder);


export default folderRouter;
