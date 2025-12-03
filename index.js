import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';

mongoose.connect(process.env.MONGODB_URI);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Ease My Wedding Backend');
});

//routes
import userRouter from './routesv1/router.js';
app.use('/apiv1', userRouter);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});