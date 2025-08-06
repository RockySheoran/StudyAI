import { IInterview } from "@/types/interview";


export const fetchInterview = async (id: string): Promise<IInterview> => {
  const response = await fetch(`/api/interview/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch interview');
  }
  return response.json();
};

export const startInterview = async (type: 'personal' | 'technical'): Promise<IInterview> => {
  const response = await fetch('/api/interview/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to start interview');
  }
  
  return response.json();
};

export const sendInterviewMessage = async (
  interviewId: string,
  message: string
): Promise<IInterview> => {
  const response = await fetch('/api/interview/continue', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ interviewId, message }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to send message');
  }
  
  return response.json();
};

export const getInterviewHistory = async (): Promise<IInterview[]> => {
  const response = await fetch('/api/interview/history');
  if (!response.ok) {
    throw new Error('Failed to fetch interview history');
  }
  return response.json();
};