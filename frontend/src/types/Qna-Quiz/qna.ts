// frontend/src/types/qna.ts
export interface QnAQuestion {
  _id?: string;
  question: string;
  maxMarks: number;
}

export interface QnAData {
  _id: string;
  educationLevel: string;
  topic: string;
  questions: QnAQuestion[];
}

export interface QnAEvaluation {
  question: string;
  answer: string;
  score: number;
  maxMarks: number;
  feedback: string;
}

export interface QnAResult {
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  evaluations: QnAEvaluation[];
}