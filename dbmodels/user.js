import { Schema, model } from 'mongoose';

const userSchema = new Schema({
    email: { type: String, required: true, select: false },
    username: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    password: { type: String, required: true, select: false },
    roles: { type: [String], required: true },
    following: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
});

export default model('User', userSchema);