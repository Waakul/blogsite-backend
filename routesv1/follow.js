import { Router } from "express";
import getUser from "../utils/getUser.js";
import User from "../dbmodels/user.js";

const router = Router();

router.post("/toggle/:username", (req, res) => {
    const { sessionId } = req.cookies;
    const targetUsername = req.params.username;

    getUser(sessionId)
    .then(requestingUser => {
        if (!requestingUser) {
            return res.status(401).json({ message: 'Invalid session.' });
        }

        if (requestingUser.username === targetUsername) {
            return res.status(400).json({ message: 'You cannot follow/unfollow yourself.' });
        }

        User.findOne({ username: targetUsername })
        .then(targetUser => {
            if (!targetUser) {
                return res.status(404).json({ message: 'Target user not found.' });
            }

            const isFollowing = requestingUser.following.includes(targetUser._id);

            if (isFollowing) {
                // Unfollow
                requestingUser.following = requestingUser.following.filter(userid => userid.toString() !== targetUser._id.toString());
                requestingUser.save()
                .then(() => {
                    res.status(200).json({ message: `Unfollowed ${targetUsername} successfully.` });
                })
                .catch(err => {
                    res.status(500).json({ message: 'Error unfollowing user.', error: err });
                });
            } else {
                // Follow
                requestingUser.following.push(targetUser._id);
                requestingUser.save()
                .then(() => {
                    res.status(200).json({ message: `Followed ${targetUsername} successfully.` });
                })
                .catch(err => {
                    res.status(500).json({ message: 'Error following user.', error: err });
                });
            }
        })
        .catch(err => {
            res.status(500).json({ message: 'Error finding target user.', error: err });
        });
    })
    .catch(err => {
        res.status(401).json({ message: 'Invalid session.', error: err });
    });
});

export default router;