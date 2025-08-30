// backend/src/models/qna.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IQnAQuestion {
  question: string;
  maxMarks: number;
}

export interface IQnAResult {
  question: string;
  answer: string;
  score: number;
  maxMarks: number;
  feedback: string;
}
interface IQnAAllResult {
  totalScore: number;
  maxPossibleScore: number;
  evaluations: IQnAResult[];
}
export interface IQnA extends Document {
  educationLevel: string;
  topic: string;
  questions: IQnAQuestion[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  result: IQnAAllResult;
  type: string;
}

const QnAQuestionSchema = new Schema({
  question: { type: String, required: true },
  maxMarks: { type: Number, required: true, min: 2, max: 5 },
});

const QnAResultSchema = new Schema({
  question: { type: String},
  answer: { type: String },
 
  score: { type: Number },
  maxMarks: { type: Number },
  feedback: { type: String },
});

const AllQnAResultSchema = new Schema({
  totalScore: { type: Number },
  maxPossibleScore: { type: Number},
 
  evaluations: [QnAResultSchema],
});

const QnASchema = new Schema({
  educationLevel: { type: String, required: true },
  topic: { type: String, required: true },
  questions: [QnAQuestionSchema],
  userId: { type: String, required: true },
  result: AllQnAResultSchema,
  type: { type: String, default: 'qna', required: true },
}, {
  timestamps: true
});

export default mongoose.model<IQnA>('QnA', QnASchema);