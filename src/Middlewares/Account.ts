import mongoose from "mongoose";
import { State } from "../Interfaces/State";
import { User } from "../Interfaces/User";
import { Account } from "../Interfaces/Account";
import { conversationExists } from "./Conversation";
import { ConversationFlow } from "../Interfaces/ConversationFlow";

// Init conversation flow and current state
export function initConversationFlow(): ConversationFlow {
    const conversationFlow: ConversationFlow = Object(null);
    const firstState: State = {
        _id: new mongoose.Types.ObjectId(),
        name: "init",
        description: "First state"
    }

    const lastState: State = {
        _id: new mongoose.Types.ObjectId(),
        name: "deinit",
        description: "Last state"
    }

    conversationFlow.states = [firstState, lastState];
    return conversationFlow;
}


export function accountInUse(users: User[], account: Account): boolean {
    for (const user of users) {
        const [exists, ] = conversationExists(user, account);
        if(exists)
            return true;
    }

    return false;
}
