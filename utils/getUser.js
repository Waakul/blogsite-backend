import User from "../dbmodels/user.js";
import sessionIdModel from "../dbmodels/sessionId.js";

export default async function (sessionId) {
    return new Promise((resolve, reject) => {
        sessionIdModel.findOne({
            sessionId: sessionId
        })
        .then(session => {
            if (!session) {
                return reject(new Error('Invalid sessionId.'));
            }

            User.findById(session.user).select('+email')
            .then(user => {
                if (!user) {
                    return reject(new Error('User not found.'));
                }

                resolve(user);
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