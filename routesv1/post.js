import { Router } from "express";
import getUser from "../utils/getUser.js";
import Post from "../dbmodels/post.js";

const router = Router();

router.post('/', (req, res) => {
    const { content } = req.body;
    const { sessionId } = req.cookies;
    
    getUser(sessionId)
    .then((user) => {
        const newPost = new Post({
            user: user._id,
            content: content.toString(),
        });

        newPost.save()
        .then((savedPost) => {
            res.status(201).json({ message: 'Post created successfully.', post: savedPost });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Error saving post.', error: err });
        });
    })
    .catch((err) => {
        res.status(401).json({ message: 'Invalid session.', error: err });
    });
});

export default router;