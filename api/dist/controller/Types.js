"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zRecentChatsUser = void 0;
const zod_1 = require("zod");
exports.zRecentChatsUser = zod_1.z.object({
    fullname: zod_1.z.string().max(20).min(5)
});
