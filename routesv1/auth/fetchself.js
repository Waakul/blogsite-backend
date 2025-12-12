import { Router } from "express";
import getUser from "../../utils/getUser.js";
import User from "../../dbmodels/user.js";

const router = Router();

router.get('/', (req, res) => {
    const { sessionId } = req.cookies;
    getUser(sessionId)
    .then(async user => {
        const populatedUser = await user.populate('following', 'username displayName');
        const followers =  (await User.find({following: user._id})).map(u => ({ username: u.username, displayName: u.displayName }));
        res.status(200).json({ roles: user.roles, username: user.username, displayName: user.displayName, email: user.email, following: populatedUser.following, followers: followers });
    })
    .catch(err => {
        res.status(401).json({ message: 'Invalid session.', error: err });
    });
});

export default router;