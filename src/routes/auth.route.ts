import express from "express";
import {
    login,
    register,
    revokeUserSession
} from '../controllers/auth.controller'
import { registerValidation, loginValidation, validate } from "../validations/validate"
import { isAdminMiddleware } from '../middleware/admin'


const authRouter = express.Router();

authRouter.post("/login", loginValidation(), validate, login);
authRouter.post("/register", registerValidation(), validate, register);

authRouter.post("/revoke-session", isAdminMiddleware, revokeUserSession);

export default authRouter;
