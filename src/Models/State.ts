import mongoose from "mongoose";
import { State } from "../Interfaces/State";

const { Schema } = mongoose;

export const stateSchema = new Schema<State>({
    name: {
        type: Schema.Types.String,
        required: true
    },
    description: {
        type: Schema.Types.String,
        required: true
    }
})