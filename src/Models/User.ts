import { User } from './../Interfaces/User';
import mongoose from 'mongoose';
import { ConversationSchema } from './Conversation';

const { Schema } = mongoose;

const user = new Schema<User>({
  name: {
    type: Schema.Types.String,
    required: true
  },
  information: [{
    type: Schema.Types.Map,
    of: Schema.Types.String,
    required: false
  }],
  conversations: [{
    type: ConversationSchema,
    required: false
  }]
});

export default mongoose.model<User>('users', user);