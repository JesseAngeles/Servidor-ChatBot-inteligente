import { Account } from "../Interfaces/Account";
import mongoose from "mongoose";

const { Schema } = mongoose;

const account = new Schema<Account>({
    name: {
        type: String,
        required: true
    },
    context: {
        type: String,
        required: true
    },
    campaign: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        unique: true,
        required: true
    }
});

export default mongoose.model<Account>('accounts', account);