import mongoose from "mongoose";
import { Transition } from "../Interfaces/Transition";
import { conditionValueSchema } from "./ConditionValue";
import { stateSchema } from "./State";

const { Schema } = mongoose;

export const transitionSchema = new Schema<Transition>({
    exitState: {
        type: stateSchema,
        required: true
    },
    arrivalState: {
        type: stateSchema,
        required: true
    },
    conditions: [[{
        type: conditionValueSchema | null,
        required: true
    }]]
})