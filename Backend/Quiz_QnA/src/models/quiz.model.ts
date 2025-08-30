// quiz.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard'
}
export interface QuizResult {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  difficulty: 'easy' | 'medium' | 'hard'
}

interface IQuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  results: QuizResult[];
}


export interface IQuiz extends Document {
  educationLevel: string;
  topic: string;
  userId: string;
  questions: IQuizQuestion[];
  createdAt: Date;
  updatedAt: Date;
  result:IQuizResult;
}

export interface IQuiz extends Document {
  educationLevel: string;
  topic: string;
  userId: string;
  questions: IQuizQuestion[];
  createdAt: Date;
  updatedAt: Date;
  result:IQuizResult;
  type: string;
}

const QuizQuestionSchema = new Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  
});

const QuizResultSchema = new Schema({
  question: { type: String},
  userAnswer: { type: String },
  correctAnswer: { type: String },
  isCorrect: { type: Boolean },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
});

const AllQuizResultSchema = new Schema({
  score: { type: Number },
  totalQuestions: { type: Number},
  percentage: { type: Number },
  results: [QuizResultSchema],
});

const QuizSchema = new Schema({
  educationLevel: { type: String, required: true },
  userId: { type: String, required: true },
  topic: { type: String, required: true },
  questions: [QuizQuestionSchema],
  result: AllQuizResultSchema,
  type: { type: String, default: 'quiz', required: true },
}, {
  timestamps: true
});

export default mongoose.model<IQuiz>('Quiz', QuizSchema);