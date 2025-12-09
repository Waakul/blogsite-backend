import { Router } from "express";
import User from "../dbmodels/user.js";
import Post from "../dbmodels/post.js";
import getUser from "../utils/getUser.js";

const router = Router();

router.get("/:username", (req, res) => {
    const { username } = req.params;
    const { sessionId } = req.cookies;
    
    User.findOne({ username: username })
    .then(user => {
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        User.countDocuments({following: user._id})
        .then(followerCount => {
            Post.find({user: user._id})
            .then(posts => {
                getUser(sessionId)
                .then(requestingUser => {
                    res.json({
                        username: user.username,
                        displayName: user.displayName,
                        following: user.following.length,
                        followers: followerCount,
                        posts: posts.map(post => ({
                            author: user.username,
                            authorDisplayName: user.displayName,
                            content: post.content.toString(),
                            createdAt: post.dateofcreation,
                        })),
                        isFollowing: requestingUser ? requestingUser.following.includes(user._id) : false,
                    });
                })
                .catch(err => {
                    res.json({
                        username: user.username,
                        displayName: user.displayName,
                        following: user.following.length,
                        followers: followerCount,
                        posts: posts.map(post => ({
                            author: user.username,
                            authorDisplayName: user.displayName,
                            content: post.content.toString(),
                            createdAt: post.dateofcreation,
                        })),
                    });
                });
            })
            .catch(err => {
                console.error(err);
                res.status(500).json({ message: "Server error" });
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        });
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    });
});

export default router;