// frontend/src/lib/api.ts
import axios from 'axios';
import { getSession } from 'next-auth/react';
export const API_BASE_URL = process.env.NEXT_PUBLIC_QUIZ_QNA_BACKEND_URL || 'http://localhost:8004/api';

interface UserStorage {
  state: {
    token?: string;
    refreshToken?: string;
    // Add other user state properties if needed
  };
}
// Create axios instance with default config
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
});

// Request interceptor for adding auth tokens if needed
apiClient.interceptors.request.use(async (config) => {
  // Only run in client-side environment
  if (typeof window !== 'undefined') {
    try {
      // Check for localStorage token first
      const userStorage = localStorage.getItem('user-storage');
      let token: string | undefined;
      
      if (userStorage) {
        const user: UserStorage = JSON.parse(userStorage);
        token = user.state?.token;
      }

      // If no localStorage token, check for NextAuth session
      if (!token) {
        const session = await getSession();
        token = session?.accessToken ;
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error setting auth token:', error);
      // Don't block the request if there's an error
    }
  }
  
  return config;
});

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
      
      if (error.response.status === 401) {
        // Handle unauthorized access
        // localStorage.removeItem('authToken');
        // window.location.href = '/login';
      } else if (error.response.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.request);
      throw new Error('Network error. Please check your connection.');
    } else {
      // Something else happened
      console.error('Error:', error.message);
      throw new Error('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

export const api = {
  // Quiz endpoints
  generateQuiz: async (data: { educationLevel: string; topic: string }) => {
    try {
      const response = await apiClient.post('/quiz/generate', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to generate quiz');
    }
  },
  
  submitQuiz: async (data: { quizId: string; answers: string[] }) => {
    try {
      const response = await apiClient.post('/quiz/submit', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to submit quiz');
    }
  },
  
  getQuiz: async (id: string) => {
    try {
      const response = await apiClient.get(`/quiz/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch quiz');
    }
  },
  
  // QnA endpoints
  generateQnA: async (data: { educationLevel: string; topic: string; marks: number }) => {
    try {
      const response = await apiClient.post('/qna/generate', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to generate QnA');
    }
  },
  
  submitQnA: async (data: { qnaId: string; answers: string[] }) => {
    try {
      const response = await apiClient.post('/qna/submit', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to submit QnA');
    }
  },
  
  getQnA: async (id: string) => {
    try {
      const response = await apiClient.get(`/qna/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch QnA');
    }
  },
};

// Export the axios instance for direct use if needed
export default apiClient;