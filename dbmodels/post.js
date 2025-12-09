import {Schema, model} from "mongoose";

const postSchema = new Schema({
    user: { type: Schema.Types.ObjectId, required: true, ref: 'user' },
    content: { type: String, required: true },
    dateofcreation: { type: Date, default: Date.now }
});

export default model('posts', postSchema);