import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkHistory {
  companyName: string;
  title: string;
  startDate?: Date;
  endDate?: Date;
  description?: string;
}

export interface IWorker extends Document {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  gender?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  address?: string;
  tradeCategory: 'electrician' | 'plumber' | 'carpenter' | 'delivery' | 'driver' | 'housekeeping' | 'mechanic' | 'fresher' | 'other';
  currentSalaryEst?: number;
  languages: string[];
  skills: string[];
  experienceYears: number;
  verifiedBadges: Array<{
    badgeName: string;
    verifiedAt: Date;
    score: number;
  }>;
  workHistory: IWorkHistory[];
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const WorkHistorySchema = new Schema<IWorkHistory>({
  companyName: { type: String, required: true },
  title: { type: String, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  description: { type: String }
});

const WorkerSchema = new Schema<IWorker>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true, 
      unique: true 
    },
    fullName: { 
      type: String, 
      required: true 
    },
    gender: { 
      type: String 
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
      type: String 
    },
    tradeCategory: { 
      type: String, 
      enum: ['electrician', 'plumber', 'carpenter', 'delivery', 'driver', 'housekeeping', 'mechanic', 'fresher', 'other'], 
      required: true 
    },
    currentSalaryEst: { 
      type: Number 
    },
    languages: { 
      type: [String], 
      default: ['en'] 
    },
    skills: { 
      type: [String], 
      default: [] 
    },
    experienceYears: { 
      type: Number, 
      default: 0 
    },
    verifiedBadges: [
      {
        badgeName: { type: String, required: true },
        verifiedAt: { type: Date, default: Date.now },
        score: { type: Number, required: true }
      }
    ],
    workHistory: { 
      type: [WorkHistorySchema], 
      default: [] 
    },
    rating: { 
      type: Number, 
      default: 5.0 
    },
    reviewCount: { 
      type: Number, 
      default: 0 
    }
  },
  { 
    timestamps: true 
  }
);

// Geo-spatial Index for nearby location queries
WorkerSchema.index({ location: '2dsphere' });

export const Worker = mongoose.model<IWorker>('Worker', WorkerSchema);
export default Worker;
