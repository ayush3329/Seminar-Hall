"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Content = new mongoose_1.default.Schema({
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
}, { timestamps: true });
const MessageSchema = new mongoose_1.default.Schema({
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
exports.Message = mongoose_1.default.model('Message', MessageSchema);
