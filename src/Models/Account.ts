import { Account } from "../Interfaces/Account";
import mongoose from "mongoose";
import { conversationFlowSchema } from "./ConversationFlow";

const { Schema } = mongoose;

const accountSchema = new Schema<Account>({
    name: {
        type: Schema.Types.String,
        required: true
    },
    context: {
        type: Schema.Types.String,
        required: true
    },
    campaign: {
        type: Schema.Types.String,
        required: true
    },
    phone: {
        type: Schema.Types.String,
        unique: true,
        required: true
    },
    conversationFlow: {
        type: conversationFlowSchema,
        required: false
    }
});

export default mongoose.model<Account>('accounts', accountSchema);
