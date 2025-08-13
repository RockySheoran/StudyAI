export interface IInterviewMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface feedback {
  rating: number;
  suggestions: string[];
  strengths: string[];
};

export interface IInterview {
  _id: string;
  userId: string;
  type: 'personal' | 'technical';
  resumeId: string;
  messages: IInterviewMessage[];
  feedback?:  feedback;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}