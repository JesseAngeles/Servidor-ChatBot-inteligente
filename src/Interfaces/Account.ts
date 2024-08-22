import { ConversationFlow } from "./ConversationFlow";
import { NextState } from "./NextState";
import { State } from "./State";

export interface Account {
    _id: any,
    name: string;
    context: string;
    information: {[key: string]: string}[] | null;
    conversationFlow: ConversationFlow;
}