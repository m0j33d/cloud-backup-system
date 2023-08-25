import express from "express";
import authRouter from "./auth.route";
import fileRouter from "./file.route";
import folderRouter from "./folder.route";
import authenticate from '../middleware/authenticate'

const router = express.Router();

router.get("/ping", (req, res) => {
    res.send("pong");
});

router.use("/api/auth", authRouter);
router.use("/api/file", authenticate, fileRouter);
router.use("/api/folder", authenticate, folderRouter);

export default router;
