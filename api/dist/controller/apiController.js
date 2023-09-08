"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSequence = exports.createOrdinarChat = exports.getGroupInfo = exports.RecentChatsUser = exports.ordinaryChat = exports.createGroup = exports.SearchUser = exports.jwtt = exports.Signup = exports.Login = void 0;
/* eslint-disable turbo/no-undeclared-env-vars */
const UserDetail_1 = require("../Schema/UserDetail");
const Message_1 = require("../Schema/Message");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const ui_1 = require("@ayush/ui");
const Types_1 = require("./Types");
dotenv_1.default.config();
//login
function Login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Login");
        const { username, password } = req.body;
        console.log(username, password);
        if (!username || !password) {
            return res.status(500).json({
                success: false,
                msg: "Please fill all the details before submitting",
            });
        }
        const ZODobj = ui_1.LoginRequestType.safeParse({ username, password });
        console.log("z-> ", ZODobj);
        if (!ZODobj.success) {
            // console.log("object");
            return (res.status(500).json({
                success: false,
                msg: "Zod error"
            }));
        }
        try {
            const SearchUser = yield UserDetail_1.User.findOne({ username: username });
            if (!SearchUser) {
                return res.status(404).json({
                    success: false,
                    msg: "User does not exist",
                });
            }
            const comparePassword = yield bcrypt_1.default.compare(password, SearchUser.password);
            if (!comparePassword) {
                console.log("Incorrect password");
                return res.status(401).json({
                    success: false,
                    msg: "Incorrect password, please double check before submitting",
                });
            }
            const payload = {
                username: username,
                email: SearchUser.email,
            };
            console.log(payload);
            const options = {
                expiresIn: "1m",
            };
            const jwtSecret = process.env.jwtSecret || '';
            let jwt_TOKEN = jsonwebtoken_1.default.sign(payload, jwtSecret, options);
            const expirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            // Date constructor will take time in millisecond and create the Date object out of it
            const cookieOptions = {
                expires: expirationDate,
                sameSite: "none",
                secure: true,
                httpOnly: true,
            };
            return res.cookie("LoginCookie", jwt_TOKEN, cookieOptions).json({
                success: true,
                msg: "Successfully Logged in",
                fullname: SearchUser.fullname,
                profile: SearchUser.profile,
                followers: SearchUser.followers.length,
                following: SearchUser.following.length,
                jwt: jwt_TOKEN
            });
        }
        catch (e) {
            console.log("Server error, ", e);
            return res.status(500).json({
                success: false,
                msg: "Server Error",
            });
        }
    });
}
exports.Login = Login;
//signUP
function Signup(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Signup");
        const { username, fullname, email, password } = req.body;
        console.log(username, fullname, email, password);
        if (!username || !fullname || !email || !password) {
            console.log("not avail");
            return res.status(500).json({
                success: false,
                msg: "Please fill all the details before submitting",
            });
        }
        console.log("Search User Started ", username);
        const SearchUser = yield UserDetail_1.User.findOne({
            $or: [{ username: username }, { email: email }],
        });
        console.log(SearchUser);
        if (SearchUser) {
            console.log("exist");
            return res.status(500).json({
                success: false,
                msg: SearchUser.email === email
                    ? "Email already register"
                    : "username already taken",
            });
        }
        try {
            const encryptedPassword = yield bcrypt_1.default.hash(password, 10);
            const NewUser = yield UserDetail_1.User.create({
                username,
                password: encryptedPassword,
                email,
                fullname,
            });
            console.log("NewUser: ", NewUser);
            return res.status(200).json({
                success: true,
                msg: "Successfully created account",
            });
        }
        catch (e) {
            console.log("Server Error, ", e);
            return res.status(500).json({
                success: false,
                msg: "Server errro",
            });
        }
    });
}
exports.Signup = Signup;
function jwtt(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { token } = req.body;
        const jwtSecret = process.env.jwtSecret || '';
        // console.log(token, "\n \n");
        const options = {
            complete: true // This option makes the function return a decoded JWT object with header and payload
        };
        try {
            const resp = jsonwebtoken_1.default.verify(token, jwtSecret, options);
            console.log(resp.payload.username);
            next();
        }
        catch (e) {
            if (e instanceof jsonwebtoken_1.TokenExpiredError) {
                res.send("Token has been expired, please login again to get a new TOKEN");
                return;
            }
            else if (e instanceof jsonwebtoken_1.JsonWebTokenError) {
                res.send("Token has beem tampered");
                return;
            }
            else {
                console.log(e);
                res.send("Something went wrong on server");
                return;
            }
        }
    });
}
exports.jwtt = jwtt;
function SearchUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("search");
        const { username } = req.params;
        console.log("user-> ", username);
        try {
            const SearchUser = yield UserDetail_1.User.find({
                username: { $regex: `^${username}`, $options: "i" },
            });
            console.log(SearchUser);
            if (SearchUser.length == 0) {
                return res.status(404).json({
                    success: false,
                    msg: "user does not exist",
                });
            }
            var helper = [];
            for (let i = 0; i < SearchUser.length; i++) {
                var user = SearchUser[i];
                const obj = { username: user.username, fullname: user.fullname, profile: user.profile };
                helper.push(obj);
            }
            // console.log("helper \n\n");
            // console.log(helper);
            return res.status(200).json({
                success: true,
                msg: "User Found",
                user: helper
            });
        }
        catch (e) {
            return res.status(401).json({
                success: false,
                msg: "Server error",
            });
        }
    });
}
exports.SearchUser = SearchUser;
function createGroup(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { admin, participant } = req.body;
        console.log(admin);
        console.log(participant);
        try {
            const Group = yield Message_1.Message.create({ users: participant, groupChat: true, mainAdmin: admin });
            for (let i = 0; i < participant.length; i++) {
                const save = participant[i];
                const Update = yield UserDetail_1.User.findOneAndUpdate({ fullname: save }, {
                    $push: {
                        chat: {
                            $each: [{ name: Group.id, useen: 0, chatType: "gc" }],
                            $position: 0 // This specifies the position to insert (0 means at the beginning)
                        }
                    }
                });
            }
            console.log("New Group Detail ", Group);
            const participantDetails = [];
            for (let i = 0; i < participant.length; i++) {
                const user = participant[i];
                const Detail = yield UserDetail_1.User.findOne({ fullname: user });
                participantDetails.push({ username: Detail.username, fullname: Detail.fullname, profile: Detail.profile });
            }
            return (res.status(200).json({
                success: true,
                msg: "Successfull",
                groupDetail: { name: Group.groupName, profile: Group.groupProfile, messages: [], groupChat: true, parti: participantDetails },
                id: Group._id
            }));
        }
        catch (e) {
            console.log(e);
            return (res.status(411).json({
                success: false,
                msg: "Something went wrong"
            }));
        }
    });
}
exports.createGroup = createGroup;
function ordinaryChat(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("*** Ordinary Chat Api *** \n");
        const { participant, chatPresent } = req.body;
        console.log(participant, chatPresent);
        try {
            var findChat = null;
            if (chatPresent) { //if true -> Chat Exist otherwise there is no chat history with this user
                findChat = yield Message_1.Message.findOne({ users: { $all: participant }, groupChat: false });
            }
            var updateUnseenCount = yield UserDetail_1.User.findOne({ fullname: participant[1] });
            var chats = updateUnseenCount.chat;
            for (let i = 0; i < chats.length; i++) {
                if (chats[i].name === participant[0]) {
                    chats[i].unseen = 0;
                    break;
                }
            }
            updateUnseenCount = yield UserDetail_1.User.findOneAndUpdate({ fullname: participant[1] }, { chat: chats });
            const findParticipant = yield UserDetail_1.User.findOne({ fullname: participant[0] });
            var messageContent = [];
            if ((findChat === null || findChat === void 0 ? void 0 : findChat.content) !== undefined) {
                for (let i = 0; i < (findChat === null || findChat === void 0 ? void 0 : findChat.content.length); i++) {
                    var ptr = findChat.content[i];
                    var obj = { sender: ptr.sender, receiver: ptr.receiver, message: ptr.message, id: ptr._id };
                    messageContent.push(obj);
                }
            }
            else {
                console.log("Chat does not exist");
            }
            // console.log('MESSAGE\n\n\n');
            // console.log(messageContent);
            const detail = {
                name: findParticipant.username,
                profile: findParticipant.profile,
                messages: messageContent,
                groupChat: false,
                parti: [{ username: findParticipant.username, fullname: findParticipant.fullname, profile: findParticipant.profile }]
            };
            console.log("Detail");
            console.log(detail);
            res.status(200).json({
                success: true,
                msg: "Success",
                detail: detail
            });
        }
        catch (e) {
            res.status(411).json({
                success: false,
                msg: "Something went wrong"
            });
        }
    });
}
exports.ordinaryChat = ordinaryChat;
function RecentChatsUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("RCU");
        console.log(req.body);
        const { fullname } = req.body;
        try {
            console.log(fullname);
            const validInput = Types_1.zRecentChatsUser.safeParse({ fullname });
            if (!validInput.success) {
                console.log("Invalid");
                return (res.status(411).json({
                    success: false,
                    msg: validInput.error
                }));
            }
            const findUser = yield UserDetail_1.User.findOne({ fullname: fullname });
            if (!findUser) {
                return (res.status(411).json({
                    success: false,
                    msg: "User does not exist"
                }));
            }
            console.log(findUser);
            const chatLog = findUser.chat;
            console.log("chats ", chatLog);
            var chatHistory = [];
            for (let i = 0; i < chatLog.length; i++) {
                var user = chatLog[i];
                let find;
                if (user.chatType === "gc") {
                    find = yield Message_1.Message.findOne({ _id: user.name });
                    console.log(find === null || find === void 0 ? void 0 : find.users);
                }
                else {
                    find = yield UserDetail_1.User.findOne({ fullname: user.name });
                    console.log(find.fullname);
                }
                chatHistory.push({
                    name: user.chatType === "gc" ? find.groupName : find.fullname,
                    profile: user.chatType === "gc" ? find.groupProfile : find.profile,
                    type: user.chatType === "gc" ? "gc" : "oc",
                    gid: user.chatType === "gc" ? find._id : find.fullname,
                    useenCount: user.unseen
                });
            }
            console.log("ChatHistory ", chatHistory);
            return (res.status(200).json({
                success: true,
                msg: "Successfull",
                chatHistory: chatHistory,
            }));
        }
        catch (e) {
            console.log("Error");
            console.log(e);
            return (res.status(500).json({
                success: false,
                msg: "Something went wrong"
            }));
        }
    });
}
exports.RecentChatsUser = RecentChatsUser;
function getGroupInfo(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { gid } = req.body;
        console.log(gid);
        try {
            const findGroup = yield Message_1.Message.findById({ _id: gid });
            if (!findGroup) {
                console.log(`Group associated with id:${gid} does not exist`);
                return (res.status(411).json({
                    success: false,
                    msg: `Group associated with id:${gid} does not exist`
                }));
            }
            console.log(findGroup);
            var participantDetails = [];
            for (let i = 0; i < findGroup.users.length; i++) {
                let ptr = findGroup.users[i];
                let find = yield UserDetail_1.User.findOne({ fullname: ptr });
                participantDetails.push({
                    username: find.username,
                    fullname: find.fullname,
                    profile: find.profile
                });
            }
            const wrapper = {
                name: findGroup.groupName,
                profile: findGroup.groupProfile,
                messages: [],
                groupChat: true,
                parti: participantDetails
            };
            return (res.status(200).json({
                success: true,
                msg: "Successfull",
                groupDetail: wrapper,
                id: findGroup._id
            }));
        }
        catch (e) {
            console.log(e);
            return (res.status(411).json({
                success: false,
                msg: "Something went wrong"
            }));
        }
    });
}
exports.getGroupInfo = getGroupInfo;
function createOrdinarChat(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("createOrdinarChat");
        const { participant } = req.body;
        console.log(participant);
        try {
            const createChat = yield Message_1.Message.create({ users: participant, groupChat: false });
            if (!createChat) {
                return (res.status(411).json({
                    success: false,
                    msg: "Unable to create entry"
                }));
            }
            let index = 1;
            for (let i = 0; i < participant.length; i++) {
                const update = yield UserDetail_1.User.findOneAndUpdate({ fullname: participant[i] }, { $push: { chat: { name: participant[i + index], unseen: 0, chatType: "oc" } } }, { new: true });
                console.log("Update ", update);
                index = -1;
            }
            return (res.status(200).json({
                success: true,
                msg: "Successfull creation"
            }));
        }
        catch (e) {
            console.log("Something went wrong");
            return (res.status(411).json({
                success: false,
                msg: "Something went wrong"
            }));
        }
    });
}
exports.createOrdinarChat = createOrdinarChat;
// Under dev
function UpdateSequence(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Update Sequence");
        const { myFullname, update, increaseUnseenCount } = req.body;
        try {
            var myDetails = yield UserDetail_1.User.findOne({ fullname: myFullname });
            var chats = myDetails.chat;
            console.log("My chats ", chats);
            var flag = false, index = 0;
            for (let i = 0; i < chats.length; i++) {
                const selected = chats[i];
                if (selected.name === update) {
                    index = i;
                    flag = true;
                    break;
                }
            }
            if (!flag) {
                // Agr code ka flow yha aya hai to iska mtlb hai user ne chats delete kr de hai aur humko fir se add krna hai uski chatHistory me
                console.log("Not Found");
                myDetails = yield UserDetail_1.User.findOneAndUpdate({ fullname: myFullname }, { $push: { chat: { name: update, unseen: 1, chatType: "oc" } } }, { new: true });
                chats = myDetails.chat;
            }
            else {
                const selected = chats[index];
                if (increaseUnseenCount) {
                    selected.unseen++;
                }
                console.log("Found ", chats.length, " ", index);
                chats.unshift(selected);
                chats = chats.splice(index + 1, 1);
                console.log("sliced ", chats);
            }
            myDetails = yield UserDetail_1.User.findOneAndUpdate({ fullname: myFullname }, { chat: chats }, { new: true });
            console.log("Updated ", myDetails);
            const chatLog = myDetails.chat;
            var chatHistory = [];
            for (let i = 0; i < chatLog.length; i++) {
                var user = chatLog[i];
                let find;
                if (user.chatType === "gc") {
                    find = yield Message_1.Message.findOne({ _id: user.name });
                    console.log(find === null || find === void 0 ? void 0 : find.users);
                }
                else {
                    find = yield UserDetail_1.User.findOne({ fullname: user.name });
                    console.log(find.fullname);
                }
                chatHistory.push({
                    name: user.chatType === "gc" ? find.groupName : find.fullname,
                    profile: user.chatType === "gc" ? find.groupProfile : find.profile,
                    type: user.chatType === "gc" ? "gc" : "oc",
                    gid: user.chatType === "gc" ? find._id : find.fullname,
                    useenCount: user.unseen
                });
            }
            return (res.status(200).json({
                success: true,
                msg: "Successfull",
                chatHistory: chatHistory,
            }));
        }
        catch (e) {
            console.log("Something went wrong");
            return (res.status(411).json({
                sucess: false,
                msg: "Something went wrong"
            }));
        }
    });
}
exports.UpdateSequence = UpdateSequence;
