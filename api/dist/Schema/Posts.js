"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const PostSchema = new mongoose_1.default.Schema({
    username: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User'
        }]
});
exports.Post = mongoose_1.default.model('Post', PostSchema);
