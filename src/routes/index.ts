import express from "express";
import authRouter from "./auth.route";
import fileRouter from "./file.route";
import folderRouter from "./folder.route";
import adminRouter from "./admin.route";
import authenticate from '../middleware/authenticate'
import { isAdminMiddleware } from '../middleware/admin'


const router = express.Router();

router.get("/ping", (req, res) => {
    res.send("pong");
});

router.use("/api/auth", authRouter);
router.use("/api/file", authenticate, fileRouter);
router.use("/api/folder", authenticate, folderRouter);
router.use("/api/admin", authenticate, isAdminMiddleware, adminRouter);

export default router;
