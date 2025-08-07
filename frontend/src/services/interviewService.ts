import apiClient from '@/lib/api';
import { IInterview } from '@/types/interview';

export const InterviewService = {
  async createInterview(type: 'personal' | 'technical', resume?: File): Promise<IInterview> {
    const formData = new FormData();
    formData.append('type', type);
    if (resume) formData.append('resume', resume);

    const response = await apiClient.post('/interviews', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getInterview(id: string): Promise<IInterview> {
    const response = await apiClient.get(`/interviews/${id}`);
    return response.data;
  },

  async sendMessage(interviewId: string, message: string): Promise<IInterview> {
    const response = await apiClient.post(`/interviews/${interviewId}/messages`, { content: message });
    return response.data;
  },

  async completeInterview(interviewId: string): Promise<IInterview> {
    const response = await apiClient.post(`/interviews/${interviewId}/complete`);
    return response.data;
  },

  async getInterviewHistory(): Promise<IInterview[]> {
    const response = await apiClient.get('/interviews/history');
    return response.data;
  },

  async uploadResume(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('resume', file);
    await apiClient.post('/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};