import { Condition, State, Transition, ConversationFlow } from "../Interfaces/ConversationFlow";
import mongoose from "mongoose";

const { Schema } = mongoose;

const conditionSchema = new Schema<Condition>({
    name: {
        type: String,
        required: true
    },
    values: [{
        type: Schema.Types.Mixed,
        required: true
    }]
});

const stateSchema = new Schema<State>({
    name: {
        type: Schema.Types.String,
        required: true
    },
    description: {
        type: Schema.Types.String,
        required: true
    }
});

const transitionSchema = new Schema<Transition>({
    exit: {
        type: stateSchema,
        required: true
    },
    arrival: {
        type: stateSchema,
        required: true
    },
    conditions: [[{
        type: [
            {
                type: conditionSchema,
                required: true
            },
            {
                type: Schema.Types.Number,
                required: true
            }
        ],
        required: false
    }]]
});

export const conversationFlowSchema = new Schema<ConversationFlow>({
    conditions: {
        type: [conditionSchema],
        required: true
    },
    states: {
        type: [stateSchema],
        required: true
    },
    transitions: {
        type: [transitionSchema],
        required: true
    }
});