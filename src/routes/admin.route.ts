import express from "express";
import {
    revokeUserSession
} from '../controllers/auth.controller'
import {
    markAsUnsafeAndDelete,
    getAllUploads,
    getSingleUpload
} from '../controllers/file.controller'

const adminRouter = express.Router();

adminRouter.post("/revoke-session", revokeUserSession);

adminRouter.put("/status/:fileSlug", markAsUnsafeAndDelete)

adminRouter.get("/uploads", getAllUploads)

adminRouter.get("/uploads/:fileSlug", getSingleUpload)

export default adminRouter;
