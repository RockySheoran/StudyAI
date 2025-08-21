// backend/src/models/qna.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IQnAQuestion {
  question: string;
  maxMarks: number;
}

export interface IQnA extends Document {
  educationLevel: string;
  topic: string;
  questions: IQnAQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

const QnAQuestionSchema = new Schema({
  question: { type: String, required: true },
  maxMarks: { type: Number, required: true, min: 2, max: 5 },
});

const QnASchema = new Schema({
  educationLevel: { type: String, required: true },
  topic: { type: String, required: true },
  questions: [QnAQuestionSchema],
}, {
  timestamps: true
});

export default mongoose.model<IQnA>('QnA', QnASchema);