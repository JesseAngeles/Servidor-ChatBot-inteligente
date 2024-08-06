import mongoose from "mongoose";
import { Account } from "../Interfaces/Account";
import { conversationFlowSchema } from "./ConversationFlow";
import { stateSchema } from "./State";
import { nextStateSchema } from "./NextState";

const { Schema } = mongoose;

export const accountSchema = new Schema<Account>({
    name: {
        type: Schema.Types.String,
        required: true
    },
    context: {
        type: Schema.Types.String,
        required: true
    },
    conversationFlow: {
        type: conversationFlowSchema,
        required: true,
    },
    currentState: {
        type: stateSchema,
        required: true
    },
    nextStates: [{
        type: nextStateSchema,
        required: true
    }]
})

export default mongoose.model<Account>('accounts', accountSchema);