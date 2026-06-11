import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  employerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  tradeCategory: 'electrician' | 'plumber' | 'carpenter' | 'delivery' | 'driver' | 'housekeeping' | 'mechanic' | 'fresher' | 'other';
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  address: string;
  salaryRange?: string;
  jobType: 'full-time' | 'gig' | 'contract';
  requiredSkills: string[];
  status: 'open' | 'filled' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    employerId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    title: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    tradeCategory: { 
      type: String, 
      enum: ['electrician', 'plumber', 'carpenter', 'delivery', 'driver', 'housekeeping', 'mechanic', 'fresher', 'other'], 
      required: true 
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      }
    },
    address: { 
      type: String, 
      required: true 
    },
    salaryRange: { 
      type: String 
    },
    jobType: { 
      type: String, 
      enum: ['full-time', 'gig', 'contract'], 
      default: 'contract' 
    },
    requiredSkills: { 
      type: [String], 
      default: [] 
    },
    status: { 
      type: String, 
      enum: ['open', 'filled', 'closed'], 
      default: 'open' 
    }
  },
  { 
    timestamps: true 
  }
);

// 2dsphere index on location for geographic proximity searches
JobSchema.index({ location: '2dsphere' });

export const Job = mongoose.model<IJob>('Job', JobSchema);
export default Job;
