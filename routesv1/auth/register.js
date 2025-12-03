import { Router } from "express";
import User from "../../dbmodels/user.js";
import {createOtp, verifyOtp} from "../../utils/otp.js";

const router = Router();

router.post('/user', (req, res) => {
    const { email } = req.body;

    User.findOne({
        email: email,
    })
    .then(existingUser => {
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        createOtp(email)
        .then(() => {
            res.status(200).json({ message: 'OTP sent to email. Please verify to complete registration.' });
        })
        .catch(err => {
            res.status(500).json({ message: 'Error sending OTP.', error: err });
        });
    })
});

router.post('/user/verify-otp', (req, res) => {
    const { email, password, otpCode } = req.body;

    const newUser = new User({
        email,
        password,
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
});

export default router;