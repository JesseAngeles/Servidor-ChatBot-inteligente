import { Conversation } from "./Conversation";

export interface User {
    name: string;
    conversations: Conversation[] | null; 
}