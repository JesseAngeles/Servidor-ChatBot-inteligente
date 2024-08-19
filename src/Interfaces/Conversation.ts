import { Account } from "./Account";
import { Message } from "./Message";
import { NextState } from "./NextState";
import { State } from "./State";

export interface Conversation {
    account: Account,
    messages: Message[] | null;
    nextStates: NextState[] | null;
    currentState: State
}