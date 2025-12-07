import { Router } from "express";

const router = Router();

//routes
import register from "./register.js";
router.use('/register', register);

import login from "./login.js";
router.use('/login', login);

import fetchself from "./fetchself.js";
router.use('/fetchself', fetchself);

import forgotPassword from "./forgotPassword.js";
router.use('/forgotPassword', forgotPassword);

export default router;