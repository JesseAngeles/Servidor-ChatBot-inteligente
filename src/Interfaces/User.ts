import { Conversation } from "./Conversation";

export interface User {
    name: string;
    phone: string;
    email: string;
    conversations: Conversation[]; 
}