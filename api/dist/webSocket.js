"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_1 = require("websocket");
const http_1 = __importDefault(require("http"));
const ws_controller_1 = require("./ws-controller/ws-controller");
const dbConnect_1 = require("./config/dbConnect");
(0, dbConnect_1.dbConnect)();
const httpServer = http_1.default.createServer((req, res) => {
    console.log("Server started");
});
const websocket = new websocket_1.server({
    "httpServer": httpServer
});
var connectionsToUser = new Map();
var UserToConnection = new Map();
websocket.on("request", (request) => {
    console.log("New Request");
    const user = request.resourceURL.query.userID;
    let connections = request.accept(null, request.origin);
    connectionsToUser.set(connections, user);
    UserToConnection.set(user, connections);
    console.log("Active Connection ", UserToConnection.size);
    console.log("keys ", UserToConnection.keys());
    connections.on("message", (data) => {
        const parsedData = JSON.parse(data.utf8Data);
        let query = parsedData.query;
        console.log("query ", query);
        if (query === "message") {
            (0, ws_controller_1.HandleMessages)(parsedData, UserToConnection);
        }
        else if (query === "zeroUnseenMessage") {
            (0, ws_controller_1.HandleZeroUneenMessage)(parsedData, UserToConnection);
        }
        else if (query === "createGroupChat") {
            (0, ws_controller_1.createGroupChat)(parsedData.packet, UserToConnection);
        }
        else if (query === "changeGroupName") {
            (0, ws_controller_1.changeGroupName)(parsedData.packet, UserToConnection);
        }
    });
    connections.on("close", (code, des) => {
        console.log("Close event");
        var saveUser = connectionsToUser.get(connections);
        UserToConnection.delete(saveUser);
        connectionsToUser.delete(connections);
        console.log(code);
        console.log(des);
        console.log("\n\n");
    });
});
httpServer.listen(9999, () => {
    console.log("http server started at 9999");
});
console.log("Hello world");
