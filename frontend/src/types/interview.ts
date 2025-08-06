export interface IInterviewMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date | string;
  }
  
  export interface IInterviewFeedback {
    rating: number;
    suggestions: string[];
    strengths: string[];
  }
  
  export interface IInterview {
    _id: string;
    userId: string;
    type: 'personal' | 'technical';
    resumeId: string;
    messages: IInterviewMessage[];
    feedback?: IInterviewFeedback;
    createdAt: Date | string;
    completedAt?: Date | string;
  }
  
  // For API responses
  export interface InterviewResponse {
    interview: IInterview;
    isComplete?: boolean;
  }
  
  // For the interview history list
  export interface InterviewHistoryItem {
    _id: string;
    type: 'personal' | 'technical';
    createdAt: Date | string;
    completedAt?: Date | string;
    rating?: number;
  }