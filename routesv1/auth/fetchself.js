import { Router } from "express";
import getUser from "../../utils/getUser.js";

const router = Router();

router.get('/', (req, res) => {
    const { sessionId } = req.query;
    getUser(sessionId)
    .then(user => {
        res.status(200).json({ roles: user.roles, username: user.username, displayName: user.displayName, email: user.email });
    })
    .catch(err => {
        res.status(401).json({ message: 'Invalid session.', error: err });
    });
});

export default router;