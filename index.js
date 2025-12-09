import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';

mongoose.connect(process.env.MONGODB_URI);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));  
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('BlogIt Backend - Copyright 2025 Waakul. Source code public on github.');
});

//routes
import userRouter from './routesv1/router.js';
app.use('/v1', userRouter);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});