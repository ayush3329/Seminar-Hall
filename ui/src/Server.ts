import { string, z } from 'zod'
import { ChatsType, Genz } from './ApiControllerTypes'

// Login Route
export const LoginReturnType = z.object( //for sending data to frontend from backend
    {
        success: z.boolean(),
        msg: z.string(),
        fullname: z.string().optional(),
        username: z.string().optional(),
        profile: z.string().optional(),
        followers: z.string().optional(),
        following: z.string().optional(),
        jwt: z.string().optional(),
    }
)

export const LoginRequestType = z.object({ //credential comming from frontend
    username: z.string(),
    password: z.string(),
})

export type LoginResponseType = z.infer<typeof LoginReturnType> //for data comming from backend to frontend


export type chatDetail = {
    sender: string,
    receiver: string[],
    content: string,
    chatType: "gc" | "oc",
    status: "seen" | "unseen",
    id?: string
}

export type Group = {
    admin: string;
    participant: string[];
}

export type zeroUnseenMessage = {
    myName: string,
    sender: string,
    type: string
}

export type newGroupName = {
    id: string, 
    newGroupName: string
}


export type PacketType = chatDetail & { newChat?: boolean } |  ChatsType |  Group | zeroUnseenMessage | newGroupName



export type sendMessagePacket = {
    query: string;
    packet: PacketType
};

export type createdGroupDetails = {
    groupDetail: {name: string, profile: string, messages: [], groupChat: boolean, parti: Genz[]},
    id: Object
}



export type receiveMessagePacket = {
    query: string;
    packet: createdGroupDetails | chatDetail | ChatsType | newGroupName
};




