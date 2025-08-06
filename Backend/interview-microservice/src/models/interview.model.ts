import mongoose, { Document } from 'mongoose';

export interface IInterviewMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IInterview extends Document {
  userId: string;
  type: 'personal' | 'technical';
  resumeId: string;
  messages: IInterviewMessage[];
  feedback?: {
    rating: number;
    suggestions: string[];
    strengths: string[];
  };
  createdAt: Date;
  completedAt?: Date;
}

const interviewSchema = new mongoose.Schema<IInterview>({
  userId: { type: String, required: true },
  type: { type: String, enum: ['personal', 'technical'], required: true },
  resumeId: { type: String, required: true },
  messages: [
    {
      role: { type: String, enum: ['user', 'assistant'], required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    suggestions: [{ type: String }],
    strengths: [{ type: String }],
  },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

export const Interview = mongoose.model<IInterview>('Interview', interviewSchema);