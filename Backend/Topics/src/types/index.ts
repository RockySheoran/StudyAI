export interface TopicRequest {
  topic: string;
  detailLevel: 'less' | 'more' | 'most';
}

export interface TopicResponse {
  topic: string;
  definition: string;
  detailLevel: string;
  timestamp: Date;
}

export interface TopicHistory {
  topic: string;
  definition: string;
  detailLevel: string;
  timestamp: Date;
  userId?: string;
}