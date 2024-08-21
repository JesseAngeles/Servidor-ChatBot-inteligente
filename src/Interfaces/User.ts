import { Conversation } from "./Conversation";

export interface User {
    name: string;
    information: {[key: string]: string}[] | null;
    conversations: Conversation[] | null; 
}