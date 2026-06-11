import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  phoneNumber: string;
  role: 'worker' | 'employer' | 'admin';
  preferredLanguage: string;
  otpCode?: string;
  otpExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    phoneNumber: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true 
    },
    role: { 
      type: String, 
      enum: ['worker', 'employer', 'admin'], 
      default: 'worker' 
    },
    preferredLanguage: { 
      type: String, 
      default: 'en' 
    },
    otpCode: { 
      type: String 
    },
    otpExpiresAt: { 
      type: Date 
    },
  },
  { 
    timestamps: true 
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
export default User;
