import { Router } from "express";
import User from "../../dbmodels/user.js";
import {createOtp, verifyOtp} from "../../utils/otp.js";
import bcrypt from "bcrypt";

async function hashPassword(password) {
    const saltRounds = 10; // cost factor
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
}

const router = Router();

router.post('/user', (req, res) => {
    const { username, email } = req.body;

    if (!username || !email) {
        return res.status(400).json({ message: 'Username and email are required.' });
    }

    if (username.length < 3 || username.length > 30) {
        return res.status(400).json({ message: 'Username must be between 3 and 30 characters.' });
    }

    User.findOne({
        username: username,
    })
    .then(existingUser => {
        if (existingUser) {
            return res.status(400).json({ message: 'User with this username already exists.' });
        }

        createOtp(email)
        .then(() => {
            res.status(200).json({ message: 'OTP sent to email. Please verify to complete registration.' });
        })
        .catch(err => {
            res.status(500).json({ message: 'Error sending OTP.', error: err });
        });
    })
    .catch(err => {
        res.status(500).json({ message: 'Error checking existing user.', error: err });
    });
});

router.post('/user/verify-otp', (req, res) => {
    const { email, username, displayName, password, otpCode } = req.body;

    if (!username || !email) {
        return res.status(400).json({ message: 'Username and email are required.' });
    }

    if (username.length < 3 || username.length > 30) {
        return res.status(400).json({ message: 'Username must be between 3 and 30 characters.' });
    }

    if (!password || password.length < 6 || password.length > 100) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long and less than 100 characters.' });
    }

    User.findOne({
        username: username,
    })
    .then(async existingUser => {
        if (existingUser) {
            return res.status(400).json({ message: 'User with this username already exists.' });
        }

        const hashedPassword = await hashPassword(password);

        const newUser = new User({
            email,
            username,
            displayName,
            password: hashedPassword,
            roles: ['user'],
        });
    
        verifyOtp(email, otpCode)
        .then(() => {
            newUser.save()
            .then(() => {
                res.status(201).json({ message: 'User registered successfully.' });
            })
            .catch(err => {
                res.status(500).json({ message: 'Error registering user.', error: err });
            });
        })
        .catch(err => {
            res.status(400).json({ message: 'OTP verification failed.', error: err });
        });
    })
    .catch(err => {
        res.status(500).json({ message: 'Error checking existing user.', error: err });
    });
});

export default router;