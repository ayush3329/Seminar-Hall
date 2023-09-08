import { Genz } from "./ApiControllerTypes";
export interface loginDetailType {
    username: string;
    fullname: string;
    password: string;
    profile: string;
    post: number;
    following: number;
    followers: number;
    bio: string;
}
export interface Debris {
    name: string;
    profile: string;
    messages: [];
    groupChat: boolean;
    parti: Genz[];
}
