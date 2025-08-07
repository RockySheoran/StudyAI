interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface IFeedback {
  rating: number;
  strengths: string[];
  suggestions: string[];
  summary: string;
}

export interface IInterview {
  _id: string;
  type: 'personal' | 'technical';
  userId: string;
  messages: IMessage[];
  feedback?: IFeedback;
  createdAt: Date;
  completedAt?: Date;
  resumeUsed?: boolean;
}