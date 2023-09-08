"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginRequestType = exports.LoginReturnType = void 0;
const zod_1 = require("zod");
// Login Route
exports.LoginReturnType = zod_1.z.object(//for sending data to frontend from backend
{
    success: zod_1.z.boolean(),
    msg: zod_1.z.string(),
    fullname: zod_1.z.string().optional(),
    username: zod_1.z.string().optional(),
    profile: zod_1.z.string().optional(),
    followers: zod_1.z.string().optional(),
    following: zod_1.z.string().optional(),
    jwt: zod_1.z.string().optional(),
});
exports.LoginRequestType = zod_1.z.object({
    username: zod_1.z.string(),
    password: zod_1.z.string(),
});
