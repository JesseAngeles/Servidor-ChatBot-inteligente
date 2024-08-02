import mongoose from "mongoose";
import { Condition } from "../Interfaces/Condition";

const { Schema } = mongoose;

export const conditionSchema = new Schema<Condition>({
    name: {
        type: Schema.Types.String,
        required: true
    },
    values: [{
        type: Schema.Types.Mixed,
        required: true
    }]
})