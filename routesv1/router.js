import { Router } from "express";

const router = Router();

//routes
import authRouter from "./auth/router.js";
router.use('/auth', authRouter);

import postsRouter from "./post.js";
router.use('/post', postsRouter);

import profileRouter from "./getprofile.js";
router.use('/profile', profileRouter);

import followRouter from "./follow.js";
router.use('/follow', followRouter);

export default router;