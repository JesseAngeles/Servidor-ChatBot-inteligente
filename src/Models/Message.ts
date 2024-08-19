import mongoose from "mongoose";
import { Message } from "../Interfaces/Message";
import { bayesSchema } from "./Bayes";

const { Schema } = mongoose;

export const messageSchema = new Schema<Message>({
    from: {
        type: Schema.Types.String,
        enum: [`system`, `assitant`, `user`],
        required: true
    },
    content: {
        type: Schema.Types.String,
        required: true
    },
    feelings: {
        type: bayesSchema,
        required: false
    }
})