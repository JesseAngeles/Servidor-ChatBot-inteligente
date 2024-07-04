import { User } from './../Interfaces/User';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const user = new Schema<User>({
  name: {
    type: String,
    required: true
  }, 
  phone: {
    type: String,
    unique: true,
    required: true
  }
});

export default mongoose.model<User>('users', user);