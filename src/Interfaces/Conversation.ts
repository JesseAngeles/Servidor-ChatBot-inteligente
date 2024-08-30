import { Account } from "./Account";
import { ConditionValue } from "./ConditionValue";
import { Message } from "./Message";
import { NextState } from "./NextState";
import { State } from "./State";

export interface Conversation {
    account: Account,
    messages: Message[] | null;
    nextStates: NextState[] | null;
    currentState: State,
    variables: ConditionValue[] | null;
}