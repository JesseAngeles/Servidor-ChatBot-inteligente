import { ConversationFlow } from "./ConversationFlow";
import { NextState } from "./NextState";
import { State } from "./State";

export interface Account {
    name: string;
    context: string;
    conversationFlow: ConversationFlow;
}