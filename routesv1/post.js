import { Router } from "express";
import getUser from "../utils/getUser.js";
import Post from "../dbmodels/post.js";

const router = Router();

router.post('/', (req, res) => {
    let { content } = req.body;
    const { sessionId } = req.cookies;

    // --- CLEAN THE CONTENT HERE ---
    if (typeof content === "string") {
        // Remove all leading newlines
        content = content.replace(/^\n+/, "");
    }

    getUser(sessionId)
    .then((user) => {
        if (!user) return res.status(401).json({ message: "Invalid session." });

        const newPost = new Post({
            user: user._id,
            content: content,
        });

        const returnPost = {
            author: user.username,
            authorDisplayName: user.displayName,
            content: content,
            createdAt: newPost.dateofcreation,
        };

        newPost.save()
        .then(() => {
            res.status(201).json({
                message: "Post created successfully.",
                post: returnPost
            });
        })
        .catch((err) => {
            res.status(500).json({ message: "Error saving post.", error: err });
        });
    })
    .catch((err) => {
        res.status(401).json({ message: "Invalid session.", error: err });
    });
});

export default router;