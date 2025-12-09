import { Router } from "express";
import User from "../../dbmodels/user.js";
import sessionIdModel from "../../dbmodels/sessionId.js";
import crypto from "crypto";
import bcrypt from "bcrypt";

async function verifyPassword(password, hash) {
    const match = await bcrypt.compare(password, hash);
    return match; // true if password matches
}

const router = Router();

router.post('/', async (req, res) => {
    const { username, password } = req.body;

    User.findOne({
        username,
    }).select('+password')
    .then(async user => {
        if (!user) {
            return res.status(401).json({ message: 'Invalid username.' });
        }
        let passwordCorrect = await verifyPassword(password, user.password);

        if (!(passwordCorrect === true)) {
            return res.status(401).json({ message: 'Invalid password.' });
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