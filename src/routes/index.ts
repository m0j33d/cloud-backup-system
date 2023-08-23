import express from "express";
import authRouter from "./auth.routes";

const router = express.Router();

router.get("/ping", (req, res) => {
    res.send("pong");
});

router.use("/api/auth", authRouter);

export default router;
