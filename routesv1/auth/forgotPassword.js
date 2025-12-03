import { Router } from "express";
import { verifyOtp, createOtp } from "../../utils/otp.js";
import sessionIdModel from "../../dbmodels/sessionId.js";
import user from "../../dbmodels/user.js";

const router = Router();

router.post('/', (req, res) => {
    const { email } = req.body;

    user.findOne({ email: email })
    .then(foundUser => {
        if (!foundUser) {
            return res.status(404).json({ message: 'User not found.' });
        }
        createOtp(email)
        .then(() => {
            res.status(200).json({ message: 'OTP sent to email. Please verify to reset password.' });
        })
        .catch(err => {
            res.status(500).json({ message: 'Error sending OTP.', error: err });
        });
    })
    .catch(err => {
        res.status(500).json({ message: 'Error finding user.', error: err });
    });
});

router.post('/verify', (req, res) => {
    const { email, otpCode } = req.body;

    verifyOtp(email, otpCode)
    .then(() => {
        user.findOne({ email: email })
        .then(foundUser => {
            if (!foundUser) {
                return res.status(404).json({ message: 'User not found.' });
            }

            const sessionId = crypto.randomUUID().toString();

            const newSession = new sessionIdModel({
                user: foundUser._id,
                sessionId: sessionId,
            });

            newSession.save()
            .then(() => { 
                res.status(200).json({ message: 'OTP verified. You can now reset your password.', sessionId: sessionId });
            })
            .catch(err => {
                res.status(500).json({ message: 'Error creating session.', error: err });
            });
        })
    })
    .catch(err => {
        res.status(400).json({ message: 'OTP verification failed.', error: err });
    });
});

export default router;