import { Router } from "express";

const router = Router();

//routes
import register from "./register.js";
router.use('/register', register);

import login from "./login.js";
router.use('/login', login);

import roles from "./roles.js";
router.use('/roles', roles);

import forgotPassword from "./forgotPassword.js";
router.use('/forgotPassword', forgotPassword);

import resetPassword from "./resetPassword.js";
router.use('/resetPassword', resetPassword);

export default router;