import { Schema, model } from "mongoose";

const sessionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    resetToken: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now, expires: 600 }
});

export default model('resetToken', sessionSchema);