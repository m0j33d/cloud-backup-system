import express from "express";
import {
    revokeUserSession
} from '../controllers/auth.controller'
import {
    markAsUnsafeAndDelete,
    getAllUploads,
} from '../controllers/file.controller'

const adminRouter = express.Router();

adminRouter.post("/revoke-session", revokeUserSession);

adminRouter.put("/status/:fileId", markAsUnsafeAndDelete)
adminRouter.get("/uploads", getAllUploads)

export default adminRouter;