import otp from "../dbmodels/otp.js";
import { sendEmail } from "./email.js";

export async function createOtp(email) {
    return new Promise((resolve, reject) => {
        const newOtp = new otp({
            email: email,
            otp: Math.floor(100000 + Math.random() * 900000).toString()
        });

        newOtp.save()
        .then(() => {
            sendEmail(
                email,
                'Your OTP Code',
                `Your OTP code is: ${newOtp.otp}. It is valid for 5 minutes.`
            )
            .then(() => {
                resolve();
            })
            .catch(err => {
                reject(new Error('Failed to send OTP email: ' + err.message));
            });
        })
        .catch(err => {
            reject(new Error('Database error: ' + err.message));
        });
    });
}

export async function verifyOtp(email, otpCode) {
    return new Promise((resolve, reject) => {
        otp.findOne({
            email: email,
            otp: otpCode
        })
        .then(foundOtp => {
            if (!foundOtp) {
                return reject(new Error('Invalid OTP.'));
            }

            // Optionally, you can delete the OTP after verification
            otp.deleteOne({ _id: foundOtp._id })
            .then(() => {
                resolve();
            })
            .catch(err => {
                reject(new Error('Database error: ' + err.message));
            });
        })
        .catch(err => {
            reject(new Error('Database error: ' + err.message));
        });
    });
}