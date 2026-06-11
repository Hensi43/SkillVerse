import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
  jobId: mongoose.Types.ObjectId;
  workerId: mongoose.Types.ObjectId;
  status: 'applied' | 'shortlisted' | 'hired' | 'rejected';
  voicePitchUrl?: string; // Optional URL of recorded voice intro pitch
  appliedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    jobId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Job', 
      required: true 
    },
    workerId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Worker', 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['applied', 'shortlisted', 'hired', 'rejected'], 
      default: 'applied' 
    },
    voicePitchUrl: { 
      type: String 
    },
    appliedAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  { 
    timestamps: true 
  }
);

// Prevent duplicate applications by indexing uniqueness on jobId + workerId
ApplicationSchema.index({ jobId: 1, workerId: 1 }, { unique: true });

export const Application = mongoose.model<IApplication>('Application', ApplicationSchema);
export default Application;
