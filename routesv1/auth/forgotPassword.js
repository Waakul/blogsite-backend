import { Router } from "express";
import { verifyOtp, createOtp } from "../../utils/otp.js";
import user from "../../dbmodels/user.js";
import resetTokenModel from "../../dbmodels/resetToken.js";
import crypto from "crypto";
import bcrypt from "bcrypt";

async function hashPassword(password) {
    const saltRounds = 10; // cost factor
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
}

const router = Router();

router.post('/', (req, res) => {
    const { username } = req.body;

    user.findOne({ username }).select('+email')
    .then(foundUser => {
        if (!foundUser) {
            return res.status(404).json({ message: 'No User found.' });
        }
        createOtp(foundUser.email)
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
    const { username, otpCode } = req.body;
    
        user.findOne({ username: username }).select('+email')
        .then(foundUser => {
            if (!foundUser) {
                return res.status(404).json({ message: 'User not found.' });
            }
            verifyOtp(foundUser.email, otpCode)
            .then(() => {

                const resetToken = crypto.randomUUID().toString();

                const newToken = new resetTokenModel({
                    user: foundUser._id,
                    resetToken: resetToken,
                });

                newToken.save()
                .then(() => { 
                    res.status(200).json({ message: 'OTP verified. You can now reset your password.', token: resetToken });
                })
                .catch(err => {
                    res.status(500).json({ message: 'Error creating session.', error: err });
                });

            })
            .catch(err => {
                res.status(400).json({ message: 'OTP verification failed.', error: err });
            });
        })
});

router.post('/reset', (req, res) => {
    const {resetToken, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6 || newPassword.length > 100) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long and less than 100 characters.' });
    }

    resetTokenModel.findOne({ resetToken: resetToken })
    .then(async tokenDoc => {
        if (!tokenDoc) {
            return res.status(400).json({ message: 'Invalid or expired reset token.' });
        }
        user.findOne({ _id: tokenDoc.user })
        .then(async foundUser => {
            if (!foundUser) {
                return res.status(404).json({ message: 'User not found.' });
            }

            const hashedPassword = await hashPassword(newPassword);

            resetTokenModel.deleteMany({ user: foundUser._id })
            .then(() => {
                user.updateOne({ _id: foundUser._id }, { password: hashedPassword })
                .then(() => {
                    res.status(200).json({ message: 'Password reset successful.' });
                })
                .catch(err => {
                    res.status(500).json({ message: 'Error updating password.', error: err });
                });
            })
            .catch(err => {
                res.status(500).json({ message: 'Error clearing reset tokens.', error: err });
            });
        })
        .catch(err => {
            res.status(500).json({ message: 'Error finding user.', error: err });
        });
    })
    .catch(err => {
        res.status(500).json({ message: 'Error during password reset.', error: err });
    });
});

export default router;