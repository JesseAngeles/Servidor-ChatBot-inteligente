import { User } from './../Interfaces/User';
import mongoose from 'mongoose';
import { ConversationSchema } from './Conversation';

const { Schema } = mongoose;

const user = new Schema<User>({
  name: {
    type: Schema.Types.String,
    required: true
  },
  conversations: [{
    type: ConversationSchema,
    required: false
  }]
});

export default mongoose.model<User>('users', user);