export interface Genz {
    username: string;
    fullname: string;
    profile: string;
}
export interface SearchUserType {
    success: boolean;
    msg: string;
    user?: Genz[];
}
export interface Rookie {
    name: string;
    profile: string;
    messages: unknown[];
    groupChat: boolean;
    parti: Genz[];
}
export interface GroupType {
    success: boolean;
    msg: string;
    groupDetail?: Rookie;
    id?: Object;
}
export interface Peer2PeerChatType {
    success: boolean;
    msg: string;
    detail?: Rookie;
}
export interface RecentChatsType {
    success: boolean;
    msg: string | Object;
    chatHistory?: ChatsType[];
    groupHistory?: ChatsType[];
}
export interface ChatsType {
    name: string;
    profile: string;
    type: string;
    gid: string | Object;
    useenCount: number;
}
