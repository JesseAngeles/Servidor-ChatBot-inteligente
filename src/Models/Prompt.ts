import mongoose, { SchemaType } from "mongoose";
import { Prompt } from "../Interfaces/Prompt";

const { Schema } = mongoose;

export const promptSchema = new Schema<Prompt>({
    message: {
        type: Schema.Types.String,
        required: true
    },
    variables: [{
        type: Schema.Types.Map,
        of: String
    }]
})