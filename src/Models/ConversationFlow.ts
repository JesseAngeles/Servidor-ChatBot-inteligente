import mongoose from "mongoose";
import { ConversationFlow } from "../Interfaces/ConversationFlow";
import { conditionSchema } from "./Condition";
import { stateSchema } from "./State";
import { transitionSchema } from "./Transition";

const { Schema } = mongoose;

export const conversationFlowSchema = new Schema<ConversationFlow>({
    conditions: [{
        type: conditionSchema,
        required: true
    }],
    states: [{
        type: stateSchema,
        required: true
    }],
    transitions: [{
        type: transitionSchema,
        required: true
    }]
})

export default mongoose.model<ConversationFlow>('conversationsFlows', conversationFlowSchema);