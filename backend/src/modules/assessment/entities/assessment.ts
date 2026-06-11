import mongoose, { Schema, Document } from 'mongoose';

export interface IAssessmentAnswer {
  questionId: string;
  questionText: string;
  audioUrl: string; // Path or URL to the uploaded voice file
  transcript?: string; // Captured text from Speech-to-Text translation
}

export interface IAssessment extends Document {
  workerId: mongoose.Types.ObjectId;
  tradeCategory: 'electrician' | 'plumber' | 'carpenter' | 'delivery' | 'driver' | 'housekeeping' | 'mechanic' | 'fresher' | 'other';
  language: string;
  answers: IAssessmentAnswer[];
  scores?: {
    accuracy: number;     // Domain terminology accuracy (0-100)
    fluency: number;      // Tone, speaking pacing (0-100)
    knowledge: number;    // Overall grade (0-100)
  };
  feedback?: string;      // Structural text feedback
  badgeAwarded?: string;  // e.g. "Verified Electrician Expert"
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const AssessmentAnswerSchema = new Schema<IAssessmentAnswer>({
  questionId: { type: String, required: true },
  questionText: { type: String, required: true },
  audioUrl: { type: String, required: true },
  transcript: { type: String }
});

const AssessmentSchema = new Schema<IAssessment>(
  {
    workerId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Worker', 
      required: true 
    },
    tradeCategory: { 
      type: String, 
      enum: ['electrician', 'plumber', 'carpenter', 'delivery', 'driver', 'housekeeping', 'mechanic', 'fresher', 'other'], 
      required: true 
    },
    language: { 
      type: String, 
      required: true 
    },
    answers: { 
      type: [AssessmentAnswerSchema], 
      default: [] 
    },
    scores: {
      accuracy: { type: Number },
      fluency: { type: Number },
      knowledge: { type: Number }
    },
    feedback: { 
      type: String 
    },
    badgeAwarded: { 
      type: String 
    },
    status: { 
      type: String, 
      enum: ['pending', 'processing', 'completed', 'failed'], 
      default: 'pending' 
    }
  },
  { 
    timestamps: true 
  }
);

export const Assessment = mongoose.model<IAssessment>('Assessment', AssessmentSchema);
export default Assessment;
