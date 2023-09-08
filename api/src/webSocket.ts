import { IUtf8Message, Message, connection,  server } from 'websocket'
import http from 'http'
import { ParsedUrlQuery } from 'querystring';
import {  Group, sendMessagePacket } from '@ayush/ui';
import { HandleMessages,HandleZeroUneenMessage, changeGroupName, createGroupChat } from './ws-controller/ws-controller'; 
import { dbConnect } from './config/dbConnect';

dbConnect();

const httpServer = http.createServer((req, res) => {
    console.log("Server started");
})


const websocket = new server({
    "httpServer": httpServer
})

var connectionsToUser = new Map<connection, string>();
var UserToConnection = new Map<string, connection>();

websocket.on("request", (request) => {

    console.log("New Request");
   
    const user:string = (request.resourceURL.query as ParsedUrlQuery).userID as string;

    let connections:connection = request.accept(null, request.origin);

    connectionsToUser.set(connections, user)
    UserToConnection.set(user, connections)

    console.log("Active Connection ", UserToConnection.size);
    console.log("keys ", UserToConnection.keys());



    connections.on("message", (data:Message) => {

        const parsedData:sendMessagePacket = JSON.parse((data as IUtf8Message).utf8Data);
        let query:string = parsedData.query;


        console.log("query ", query);

        if(query==="message"){
            HandleMessages(parsedData, UserToConnection)
        } else if(query === "zeroUnseenMessage"){
            HandleZeroUneenMessage(parsedData, UserToConnection)
        } else if(query === "createGroupChat"){
            createGroupChat(parsedData.packet as Group, UserToConnection);   
        } else if(query === "changeGroupName"){
            changeGroupName(parsedData.packet as {id: string, newGroupName: string}, UserToConnection)
        }
        
    })

    connections.on("close", (code, des)=>{

        console.log("Close event");
        var saveUser = connectionsToUser.get(connections) as string;
        UserToConnection.delete(saveUser);
        connectionsToUser.delete(connections);
        console.log(code);
        console.log(des);
        console.log("\n\n");
        
    })

})

httpServer.listen(9999, () => {
    console.log("http server started at 9999");
})
console.log("Hello world");


