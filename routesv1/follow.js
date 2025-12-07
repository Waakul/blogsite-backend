import { Router } from "express";
import getUser from "../utils/getUser";

const router = Router();

router.post("/toggle/:username", (req, res) => {
    const { sessionId } = req.body;
    const targetUsername = req.params.username;

    getUser(sessionId)
    .then(requestingUser => {
        if (!requestingUser) {
            return res.status(401).json({ message: 'Invalid session.' });
        }

        if (requestingUser.username === targetUsername) {
            return res.status(400).json({ message: 'You cannot follow/unfollow yourself.' });
        }

        const isFollowing = requestingUser.following.includes(targetUsername);

        if (isFollowing) {
            // Unfollow
            requestingUser.following = requestingUser.following.filter(username => username !== targetUsername);
            requestingUser.save()
            .then(() => {
                res.status(200).json({ message: `Unfollowed ${targetUsername} successfully.` });
            })
            .catch(err => {
                res.status(500).json({ message: 'Error unfollowing user.', error: err });
            });
        } else {
            // Follow
            requestingUser.following.push(targetUsername);
            requestingUser.save()
            .then(() => {
                res.status(200).json({ message: `Followed ${targetUsername} successfully.` });
            })
            .catch(err => {
                res.status(500).json({ message: 'Error following user.', error: err });
            });
        }
    })
});

export default router;