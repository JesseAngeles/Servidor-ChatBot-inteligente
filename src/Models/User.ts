import { User } from './../Interfaces/User';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const user = new Schema<User>({
  name: {
    type: Schema.Types.String,
    required: true
  }, 
  phone: {
    type: Schema.Types.String,
    unique: true,
    required: true
  },
  email: {
    type: Schema.Types.String,
    unique: true,
    required: true
  }
});

export default mongoose.model<User>('users', user);