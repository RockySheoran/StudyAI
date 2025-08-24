import { CurrentAffair } from '@/types/Current-Affairs/CurrentAffair-types';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const fetchCurrentAffairs = async (type: 'random' | 'custom', category?: string): Promise<CurrentAffair> => {
  const response = await axios.get(`${API_BASE_URL}/current-affairs`, {
    params: { type, category }
  });
  return response.data;
};

export const fetchHistory = async (): Promise<CurrentAffair[]> => {
  const response = await axios.get(`${API_BASE_URL}/history`);
  return response.data;
};