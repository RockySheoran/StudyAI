export interface IInterviewMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IInterview {
  _id: string;
  userId: string;
  type: 'personal' | 'technical';
  resumeId: string;
  messages: IInterviewMessage[];
  feedback?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}