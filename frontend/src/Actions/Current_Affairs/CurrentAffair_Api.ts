
"use server"
import { current_affairs_url } from '@/lib/apiEnd_Point_Call';
import { CurrentAffairsResponse } from '@/types/Current-Affairs/CurrentAffair-types';
import axios from 'axios';




export const fetchCurrentAffairs = async (
  type: 'random' | 'custom', 
  category?: string,
  page: number = 1,
  token ?: string
): Promise<CurrentAffairsResponse> => {
  
  try {
    console.log(token , "token from store");
    console.log(current_affairs_url , "API_BASE_URL");
    const response = await axios.get(`${current_affairs_url}/api/current-affairs`, {
      params: { type, category, page },
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(response.data , "response data");
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const fetchHistory = async (page: number = 1, token?: string): Promise<CurrentAffairsResponse> => {
  if (!token) {
    throw new Error('Authentication token is required');
  }
  
  console.log(token , "token from store");

  try {
    const response = await axios.get(`${current_affairs_url}/api/current-affairs/history`, {
      params: { page },
      headers: { Authorization: `Bearer ${token}` },
    });
   
    return response.data;
  } catch (error:any) {
    console.error('Failed to fetch history:', error);
    throw error;
  }
};