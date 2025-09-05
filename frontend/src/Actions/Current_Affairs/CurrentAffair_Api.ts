import { current_affairs_url } from '@/lib/apiEnd_Point_Call';
import { CurrentAffairsResponse } from '@/types/Current-Affairs/CurrentAffair-types';
import axios from 'axios';

/**
 * Fetches current affairs articles based on type and optional category
 * @param type - Either 'random' for random articles or 'custom' for category-specific
 * @param category - Optional category filter for custom type requests
 * @param page - Page number for pagination (defaults to 1)
 * @param token - Authentication token for API access
 * @returns Promise containing current affairs response data
 */
export const fetchCurrentAffairs = async (
  type: 'random' | 'custom', 
  category?: string,
  page: number = 1,
  token ?: string
): Promise<CurrentAffairsResponse> => {
  
  try {
    const response = await axios.get(`${current_affairs_url}/api/current-affairs`, {
      params: { type, category, page },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetches user's current affairs reading history with pagination
 * @param page - Page number for pagination (defaults to 1)
 * @param token - Authentication token required for accessing user history
 * @returns Promise containing paginated history response
 * @throws Error if authentication token is missing
 */
export const fetchHistory = async (page: number = 1, token?: string): Promise<CurrentAffairsResponse> => {
  if (!token) {
    throw new Error('Authentication token is required');
  }

  try {
    const response = await axios.get(`${current_affairs_url}/api/current-affairs/history`, {
      params: { page },
      headers: { Authorization: `Bearer ${token}` },
    });
   
    return response.data;
  } catch (error:any) {
    throw error;
  }
};