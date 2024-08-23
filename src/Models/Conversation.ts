import mongoose from "mongoose";
import { Conversation } from "../Interfaces/Conversation";
import { accountSchema } from "./Account";
import { messageSchema } from "./Message";
import { nextStateSchema } from "./NextState";
import { stateSchema } from "./State";
import { conditionValueSchema } from "./ConditionValue";

const { Schema } = mongoose;

export const ConversationSchema = new Schema<Conversation>({
    account: {
        type: accountSchema,
        required: true
    },
    messages: [{
        type: messageSchema,
        required: false
    }],
    nextStates: [{
        type: nextStateSchema,
        required: false
    }],
    currentState: {
        type: stateSchema,
        required: true
    },
    variables: [{
        type: conditionValueSchema,
        required: false
    }]
})

