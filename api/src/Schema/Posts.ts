import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    username: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    postURL: {
        type: String,
        require: true
    },
    like: {
        type: Number,
        default: 0
    },
    liked_BY: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
})

export const Post = mongoose.model('Post', PostSchema);
