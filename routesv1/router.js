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

import searchRouter from "./search.js";
router.use('/search', searchRouter);

import feedRouter from "./feed.js";
router.use('/feed', feedRouter);

export default router;