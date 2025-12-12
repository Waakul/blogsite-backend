import {Schema, model} from "mongoose";

const postSchema = new Schema({
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    content: { type: String, required: true },
    dateofcreation: { type: Date, default: Date.now }
});

export default model('posts', postSchema);