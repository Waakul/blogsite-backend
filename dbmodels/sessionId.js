import { Schema, model } from "mongoose";

const sessionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    sessionId: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now, expires: '7d' }
});

export default model('sessionId', sessionSchema);