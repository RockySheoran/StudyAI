// quiz.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface IQuiz extends Document {
  educationLevel: string;
  topic: string;
  userId: string;
  questions: IQuizQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

const QuizQuestionSchema = new Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true }
});

const QuizSchema = new Schema({
  educationLevel: { type: String, required: true },
  userId: { type: String, required: true },
  topic: { type: String, required: true },
  questions: [QuizQuestionSchema]
}, {
  timestamps: true
});

export default mongoose.model<IQuiz>('Quiz', QuizSchema);