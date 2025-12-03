import { Router } from "express";
import User from "../../dbmodels/user.js";
import sessionIdModel from "../../dbmodels/sessionId.js";
import getUser from "../../utils/getUser.js";

const router = Router();

router.post('/', (req, res) => {
    const { sessionId, newPassword } = req.body;
    getUser(sessionId)
    .then(user => {
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        sessionIdModel.deleteMany({ user: user._id, sessionId: { $ne: sessionId } })
        .then(() => {
            User.updateOne({ _id: user._id }, { password: newPassword })
            .then(() => {
                res.status(200).json({ message: 'Password reset successful.' });
            })
            .catch(err => {
                res.status(500).json({ message: 'Error updating password.', error: err });
            });
        })
        .catch(err => {
            res.status(500).json({ message: 'Error clearing other sessions.', error: err });
        });
    })
    .catch(err => {
        res.status(401).json({ message: 'Invalid session.', error: err });
    });
});

export default router;