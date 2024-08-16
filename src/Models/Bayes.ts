import mongoose from "mongoose";
import { Bayes } from "../Interfaces/Bayes";

const {Schema} = mongoose;

export const bayesSchema = new Schema<Bayes>({
    AngerP: {
        type: Schema.Types.Number,
        required: true
    },
    FearP: {
        type: Schema.Types.Number,
        required: true
    },
    JoyP: {
        type: Schema.Types.Number,
        required: true
    },
    LoveP: {
        type: Schema.Types.Number,
        required: true
    },
    SadnessP: {
        type: Schema.Types.Number,
        required: true
    },
    SurpriseP: {
        type: Schema.Types.Number,
        required: true
    }
})