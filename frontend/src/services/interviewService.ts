// import apiClient from '@/lib/api';
// import { IInterview } from '@/types/interview';

// export const InterviewService = {
//   async createInterview(type: 'personal' | 'technical', resume?: File): Promise<IInterview> {
//     const formData = new FormData();
//     formData.append('type', type);
//     if (resume) formData.append('resume', resume);

//     const response = await apiClient.post('/interviews', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     return response.data;
//   },

//   async getInterview(id: string): Promise<IInterview> {
//     const response = await apiClient.get(`/interviews/${id}`);
//     return response.data;
//   },

//   async sendMessage(interviewId: string, message: string): Promise<IInterview> {
//     const response = await apiClient.post(`/interviews/${interviewId}/messages`, { content: message });
//     return response.data;
//   },

//   async completeInterview(interviewId: string): Promise<IInterview> {
//     const response = await apiClient.post(`/interviews/${interviewId}/complete`);
//     return response.data;
//   },

//   async getInterviewHistory(): Promise<IInterview[]> {
//     const response = await apiClient.get('/interviews/history');
//     return response.data;
//   },

//   async uploadResume(file: File): Promise<void> {
//     const formData = new FormData();
//     formData.append('resume', file);
//     await apiClient.post('/resume', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//   },
// };

import apiClient from '@/lib/api';
import { IInterview } from '@/types/interview';

// Interview related services
export const fetchInterview = async (id: string): Promise<IInterview> => {
  const response = await apiClient.get(`/interview/${id}`);
  return response.data;
};

export const startInterview = async (type: 'personal' | 'technical'): Promise<IInterview> => {
  const response = await apiClient.post('/interview/start', { type });
  return response.data;
};

export const sendInterviewMessage = async (
  interviewId: string,
  message: string
): Promise<IInterview> => {
  const response = await apiClient.post('/interview/continue', { interviewId, message });
  return response.data;
};

export const getInterviewHistory = async (): Promise<any> => {
  console.log("Fetching interview history");
  const response = await apiClient.get(`/interview/history`);
  return response.data;
};

// Resume related services
export const uploadResume = async (file: File): Promise<void> => {
  const formData = new FormData();
  formData.append('resume', file);
  await apiClient.post('/resume/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteResume = async (): Promise<void> => {
  await apiClient.delete('/resume');
};

export const getResume = async (): Promise<{ url: string }> => {
  const response = await apiClient.get('/resume');
  return response.data;
};