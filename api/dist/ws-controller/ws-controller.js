"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeGroupName = exports.createGroupChat = exports.HandleZeroUneenMessage = exports.HandleMessages = void 0;
const Message_1 = require("../Schema/Message");
const UserDetail_1 = require("../Schema/UserDetail");
function HandleMessages(parsedData, UserToConnection) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("HandleMessage");
        // console.log(parsedData);
        const chat = parsedData.packet;
        if ((chat === null || chat === void 0 ? void 0 : chat.chatType) === "oc") {
            // Ordinary Chat
            HandleOridnaryMessage(parsedData, UserToConnection);
        }
        else {
            // Group Chat
            HandleGroupMessage(parsedData.packet, UserToConnection);
        }
    });
}
exports.HandleMessages = HandleMessages;
function HandleOridnaryMessage(parsedData, UserToConnection) {
    return __awaiter(this, void 0, void 0, function* () {
        var chatPacket = parsedData.packet;
        console.log(chatPacket);
        const receiver = chatPacket.receiver[0]; //receiver will contain the name of that user jsiko message bhej rhae hai
        const sender = chatPacket.sender;
        var SenderDetail, receiverDetail;
        const participant = [chatPacket === null || chatPacket === void 0 ? void 0 : chatPacket.sender, chatPacket === null || chatPacket === void 0 ? void 0 : chatPacket.receiver[0]];
        let createChat = null, findChat = null;
        if (chatPacket.newChat) {
            // Chat does not exist
            console.log("Chat does not exist");
            console.log("participant-> ", participant);
            // Creating chat
            createChat = yield Message_1.Message.create({
                users: participant,
                content: [{ sender: chatPacket.sender, message: chatPacket.content, receiver: chatPacket.receiver[0] }],
                groupChat: false
            });
            SenderDetail = yield UserDetail_1.User.findOne({ fullname: sender });
            let chats = SenderDetail.chat;
            chats.unshift({ name: receiver, unseen: 0, chatType: "oc" });
            SenderDetail = yield UserDetail_1.User.findOneAndUpdate({ fullname: sender }, { chat: chats }, { new: true });
            receiverDetail = yield UserDetail_1.User.findOne({ fullname: receiver });
        }
        else {
            console.log("Chat already exist ", receiver);
            console.log("participant ", participant);
            receiverDetail = yield UserDetail_1.User.findOne({ fullname: receiver });
            SenderDetail = yield UserDetail_1.User.findOne({ fullname: sender });
            findChat = yield Message_1.Message.findOne({ users: { $all: participant }, groupChat: false });
            let obj = { sender: sender, receiver: receiver, message: chatPacket.content };
            // console.log(findChat);
            if (findChat) {
                let chats = findChat.content;
                console.log(chats);
                chats.push(obj);
                findChat = yield Message_1.Message.findOneAndUpdate({ users: { $all: participant }, groupChat: false }, { content: chats }, { new: true });
            }
        }
        var packet = {
            name: receiverDetail.fullname,
            profile: receiverDetail.profile,
            type: "oc",
            gid: receiverDetail.fullname,
            useenCount: 0
        };
        //updating frontend chatList (in prevChatUser) of sender
        var conn = UserToConnection.get(sender);
        conn === null || conn === void 0 ? void 0 : conn.send(JSON.stringify({ query: "updateChatList", packet: packet }));
        if (createChat) {
            let chat = createChat.content;
            chatPacket.id = chat[chat.length - 1]._id;
        }
        else if (findChat) {
            let chat = findChat.content;
            chatPacket.id = chat[chat.length - 1]._id;
        }
        var chats = receiverDetail.chat;
        var unseenCount = 1;
        //re arranging chat list of receiver -> Chat list contain fullname of all that users with whom user have a chat history
        for (let i = 0; i < chats.length; i++) {
            if (chats[i].name === sender) {
                var save = chats[i];
                chats.splice(i, 1);
                save.unseen++;
                unseenCount = save.unseen;
                chats.unshift(save);
                receiverDetail = yield UserDetail_1.User.findOneAndUpdate({ fullname: receiver }, { chat: chats }, { new: true });
                break;
            }
            else if (i === chats.length - 1) {
                chats.unshift({ name: sender, unseen: 1, chatType: "oc" });
                receiverDetail = yield UserDetail_1.User.findOneAndUpdate({ fullname: receiver }, { chat: chats }, { new: true });
            }
        }
        // This packet contain the detail of user who shoul be on top of the ChatList
        var packet = {
            name: SenderDetail.fullname,
            profile: SenderDetail.profile,
            type: "oc",
            gid: SenderDetail.fullname,
            useenCount: unseenCount
        };
        var conn = UserToConnection.get(receiver);
        conn === null || conn === void 0 ? void 0 : conn.send(JSON.stringify({ query: "updateChatList", packet: packet }));
        if (receiver !== undefined) {
            const conn = UserToConnection.get(receiver);
            const ResponsePacket = {
                query: "message",
                packet: chatPacket
            };
            conn === null || conn === void 0 ? void 0 : conn.send(JSON.stringify(ResponsePacket));
        }
    });
}
function HandleGroupMessage(packet, UserToConnection) {
    return __awaiter(this, void 0, void 0, function* () {
        //In Case of GroupChat the receiver will be all the participant in the group, but value of receiver in Packet will gid of group 
        console.log("Group Chat Messages ", packet);
        var onlineUser = [];
        for (let i = 0; i < packet.receiver.length; i++) {
            var isThisUserActive = packet.receiver[i];
            if (isThisUserActive === packet.sender) {
                continue;
            }
            // INC
        }
    });
}
function HandleZeroUneenMessage(parsedData, UserToConnection) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("HandleZeroUneenMessage");
        console.log(parsedData.packet);
        const packet = parsedData.packet;
        let findMyData = yield UserDetail_1.User.findOne({ fullname: packet.myName });
        let chats = findMyData.chat;
        for (let i = 0; i < chats.length; i++) {
            if (chats[i].chatType === packet.type && chats[i].name === packet.sender) {
                chats[i].unseen = 0;
                break;
            }
        }
        findMyData = yield UserDetail_1.User.findOneAndUpdate({ fullname: packet.myName }, { chat: chats });
    });
}
exports.HandleZeroUneenMessage = HandleZeroUneenMessage;
function createGroupChat(parsedData, UserToConnection) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(parsedData);
        const { admin, participant } = parsedData;
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
            console.log();
            for (let i = 0; i < participant.length; i++) {
                var con = UserToConnection.get(participant[i]);
                const ResponsePacket = {
                    query: "groupCreated",
                    packet: {
                        groupDetail: { name: Group.groupName, profile: Group.groupProfile, messages: [], groupChat: true, parti: participantDetails },
                        id: Group._id
                    }
                };
                con === null || con === void 0 ? void 0 : con.send(JSON.stringify(ResponsePacket));
            }
        }
        catch (e) {
            console.log(e);
        }
    });
}
exports.createGroupChat = createGroupChat;
function changeGroupName(parsedData, UserToConnection) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id, newGroupName } = parsedData;
        console.log("GroupId ", id);
        console.log("GroupId ", newGroupName);
        const GroupDetail = yield Message_1.Message.findOneAndUpdate({ _id: id }, { groupName: newGroupName }, { new: true });
        if ((GroupDetail === null || GroupDetail === void 0 ? void 0 : GroupDetail.groupName) === newGroupName) {
            for (let i = 0; i < GroupDetail.users.length; i++) {
                const user = GroupDetail.users[i];
                const con = UserToConnection.get(user);
                con === null || con === void 0 ? void 0 : con.send(JSON.stringify({ query: "groupNameChanged", packet: parsedData }));
            }
        }
    });
}
exports.changeGroupName = changeGroupName;
