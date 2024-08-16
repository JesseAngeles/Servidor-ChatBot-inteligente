import { Account } from "./Account";
import { Message } from "./Message";

export interface Conversation {
    account: Account,
    messages: Message[];
}