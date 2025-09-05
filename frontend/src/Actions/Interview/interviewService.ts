import { IInterview } from '@/types/Interview-type';
import apiClient from '@/Actions/Interview/Interview_api';

/**
 * Fetches interview data by ID
 * Returns current interview state and conversation history
 */
export const fetchInterview = async (id: string): Promise<IInterview> => {
  const response = await apiClient.get(`/interview/${id}`);
  return response.data;
};

/**
 * Initiates a new interview session
 * Creates interview with specified type and optional resume context
 */
export const startInterview = async (type: 'personal' | 'technical', resumeId: string | null): Promise<IInterview> => {
  const response = await apiClient.post('/interview/start', { type, resumeId });
  return response.data;
};

/**
 * Sends user response to continue interview conversation
 * Processes message and returns AI interviewer's next question
 */
export const sendInterviewMessage = async (
  interviewId: string,
  message: string
): Promise<IInterview> => {
  const response = await apiClient.post('/interview/continue', { interviewId, message });
  return response.data;
};

/**
 * Retrieves user's interview history
 * Returns all completed interviews with performance data
 */
export const getInterviewHistory = async (): Promise<any> => {
  const response = await apiClient.get(`/interview/history`);
  return response.data;
};

/**
 * Fetches detailed feedback for a specific interview
 * Provides performance analysis and improvement suggestions
 */
export const FeedbackService = async (id: string): Promise<any> => {
  const response = await apiClient.get(`/interview/feedback/${id}`);
  return response.data;
};

/**
 * Uploads user's resume for interview personalization
 * Supports PDF, DOC, and DOCX formats up to 10MB
 */
export const uploadResume = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('resume', file);
  const response = await apiClient.post('/resume/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Removes user's uploaded resume from the system
 * Cleans up both database records and cloud storage
 */
export const deleteResume = async (): Promise<void> => {
  await apiClient.delete('/resume');
};

/**
 * Retrieves user's current resume information
 * Returns resume metadata and download URL if available
 */
export const getResume = async (): Promise<{ url: string }> => {
  const response = await apiClient.get('/resume');
  return response.data;
};