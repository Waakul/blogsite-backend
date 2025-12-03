import { Router } from "express";
import User from "../../dbmodels/user.js";
import sessionIdModel from "../../dbmodels/sessionId.js";
import crypto from "crypto";

const router = Router();

router.post('/', (req, res) => {
    const { email, password } = req.body;
    User.findOne({
        email: email,
        password: password
    })
    .then(user => {
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const sessionId = crypto.randomUUID().toString();

        const newSession = new sessionIdModel({
            user: user._id,
            sessionId: sessionId,
        });

        newSession.save()
        .then(() => { 
            res.status(200).json({ message: 'Login successful.', sessionId: sessionId, roles: user.roles  });
        })
        .catch(err => {
            res.status(500).json({ message: 'Error creating session.', error: err });
        });
    })
    .catch(err => {
        res.status(500).json({ message: 'Error during login.', error: err });
    });
});

export default router;