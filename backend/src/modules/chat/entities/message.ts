import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  chatId: string;
  senderId: string;
  content: string;
  messageType: 'text' | 'voice';
  sentAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    chatId: { 
      type: String, 
      required: true, 
      index: true 
    },
    senderId: { 
      type: String, 
      required: true 
    },
    content: { 
      type: String, 
      required: true 
    },
    messageType: { 
      type: String, 
      enum: ['text', 'voice'], 
      default: 'text' 
    },
    sentAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  { 
    timestamps: true 
  }
);

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
export default Message;
