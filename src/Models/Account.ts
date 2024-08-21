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
    information: [{
        type: Schema.Types.Map,
        of: Schema.Types.String,
        required: false
    }],
    conversationFlow: {
        type: conversationFlowSchema,
        required: true
    }
})

export default mongoose.model<Account>('accounts', accountSchema);