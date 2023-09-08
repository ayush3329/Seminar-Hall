import { z } from 'zod';
import { ChatsType, Genz } from './ApiControllerTypes';
export declare const LoginReturnType: z.ZodObject<{
    success: z.ZodBoolean;
    msg: z.ZodString;
    fullname: z.ZodOptional<z.ZodString>;
    username: z.ZodOptional<z.ZodString>;
    profile: z.ZodOptional<z.ZodString>;
    followers: z.ZodOptional<z.ZodString>;
    following: z.ZodOptional<z.ZodString>;
    jwt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    msg: string;
    fullname?: string | undefined;
    username?: string | undefined;
    profile?: string | undefined;
    followers?: string | undefined;
    following?: string | undefined;
    jwt?: string | undefined;
}, {
    success: boolean;
    msg: string;
    fullname?: string | undefined;
    username?: string | undefined;
    profile?: string | undefined;
    followers?: string | undefined;
    following?: string | undefined;
    jwt?: string | undefined;
}>;
export declare const LoginRequestType: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
}, {
    username: string;
    password: string;
}>;
export type LoginResponseType = z.infer<typeof LoginReturnType>;
export type chatDetail = {
    sender: string;
    receiver: string[];
    content: string;
    chatType: "gc" | "oc";
    status: "seen" | "unseen";
    id?: string;
};
export type Group = {
    admin: string;
    participant: string[];
};
export type zeroUnseenMessage = {
    myName: string;
    sender: string;
    type: string;
};
export type newGroupName = {
    id: string;
    newGroupName: string;
};
export type PacketType = chatDetail & {
    newChat?: boolean;
} | ChatsType | Group | zeroUnseenMessage | newGroupName;
export type sendMessagePacket = {
    query: string;
    packet: PacketType;
};
export type createdGroupDetails = {
    groupDetail: {
        name: string;
        profile: string;
        messages: [];
        groupChat: boolean;
        parti: Genz[];
    };
    id: Object;
};
export type receiveMessagePacket = {
    query: string;
    packet: createdGroupDetails | chatDetail | ChatsType | newGroupName;
};
