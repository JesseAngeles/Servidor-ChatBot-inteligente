import mongoose from "mongoose";
import { ConditionValue } from "../Interfaces/ConditionValue";
import { conditionSchema } from "./Condition";

const { Schema } = mongoose;

export const conditionValueSchema = new Schema<ConditionValue>({
    condition: {
        type: conditionSchema,
        required: true
    },
    indexExpected: {
        type: Schema.Types.Number,
        required: true
    },
    indexValue: {
        type: Schema.Types.Number,
        required: true
    }
});