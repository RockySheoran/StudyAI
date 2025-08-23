import axios from 'axios';
import { getSession } from 'next-auth/react';

interface UserStorage {
  state: {
    token?: string;
    // Add other user state properties if needed
  };
}

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_INTERVIEW_BACKEND_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 10 seconds timeout
});

// Add request interceptor for auth token
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

// Add response interceptor for error handling
// apiClient.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     // Only handle errors in client-side environment
//     if (typeof window !== 'undefined') {
//       if (error.response?.status === 401) {
//         // Clear user data from localStorage
//         localStorage.removeItem('user-storage');
        
//         // Redirect to login with return URL
//         const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
//         window.location.href = `/login?callbackUrl=${returnUrl}`;
        
//         return Promise.reject('Session expired. Please log in again.');
//       }
      
//       // Handle other common error statuses
//       if (error.response?.status === 403) {
//         return Promise.reject('You do not have permission to access this resource.');
//       }
      
//       if (error.code === 'ECONNABORTED') {
//         return Promise.reject('Request timeout. Please try again.');
//       }
//     }
    
//     // Return a standardized error object
//     return Promise.reject({
//       status: error.response?.status,
//       message: error.response?.data?.message || error.message,
//       data: error.response?.data,
//     });
//   }
// );


// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;