import express from "express";

import {
    login,
    register
} from '../controllers/auth.controller'
import { registerValidation, loginValidation, validate } from "../validations/validate"


const authRouter = express.Router();

authRouter.post("/login", loginValidation(), validate, login);
authRouter.post("/register", registerValidation(), validate, register);

export default authRouter;
