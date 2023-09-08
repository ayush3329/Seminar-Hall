import mongoose from "mongoose";

const Content = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    receiver: {
        type: String,
        required: true
    }
},{ timestamps: true })


const MessageSchema = new mongoose.Schema({
    users: [{
        type: String,
        required: true
    }],
    content: [{
        type: Content,
        required: true
    }],
    groupChat: {
        type: Boolean,
        default: false
    },
    mainAdmin: {
        type: String,
        default: "Not a Group Chat"
    },
    admins: [{
        type: String,
        default: ["Not a group Chat"]
    }],
    groupProfile: {
        type: String,
        default: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZDwnUf1L__jY-yPvMssNnBEJWDen2pIrggw&usqp=CAU'
    },
    groupName: {
        type: String,
        default: 'Group Chat'
    }
});

export const Message = mongoose.model('Message', MessageSchema)


