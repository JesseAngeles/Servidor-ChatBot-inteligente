import mongoose from "mongoose";
import { NextState } from "../Interfaces/NextState";
import { conditionValueSchema } from "./ConditionValue";
import { stateSchema } from "./State";

const { Schema } = mongoose;

export const nextStateSchema = new Schema<NextState>({
    state: {
        type: stateSchema,
        required: true
    },
    conditions: [[{
        type: conditionValueSchema,
        required: true
    }]]
})