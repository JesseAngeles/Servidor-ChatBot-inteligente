import { ConversationFlow } from "./ConversationFlow";

export interface Account {
    name: string;
    campaign: string;
    context: string;
    phone: string;
    conversationFlow: ConversationFlow;
}