import { CurrentAffairsResponse } from '@/types/Current-Affairs/CurrentAffair-types';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const fetchCurrentAffairs = async (
  type: 'random' | 'custom', 
  category?: string,
  page: number = 1
): Promise<CurrentAffairsResponse> => {
  const response = await axios.get(`${API_BASE_URL}/current-affairs`, {
    params: { type, category, page }
  });
  return response.data;
};

export const fetchHistory = async (page: number = 1): Promise<CurrentAffairsResponse> => {
  const response = await axios.get(`${API_BASE_URL}/history`, {
    params: { page }
  });
  return response.data;
};