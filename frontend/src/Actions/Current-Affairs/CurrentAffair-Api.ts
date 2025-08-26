'use server';
import { useUserStore } from '@/lib/Store/userStore';
import { CurrentAffairsResponse } from '@/types/Current-Affairs/CurrentAffair-types';
import axios from 'axios';
import { headers } from 'next/headers';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const fetchCurrentAffairs = async (
  type: 'random' | 'custom', 
  category?: string,
  page: number = 1,
  token ?: string
): Promise<CurrentAffairsResponse> => {
  
  console.log(token , "token from store");
  const response = await axios.get(`${API_BASE_URL}/current-affairs`, {
    params: { type, category, page },
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const fetchHistory = async (page: number = 1, token?: string): Promise<CurrentAffairsResponse> => {
  console.log(token , "token from store");
  const response = await axios.get(`${API_BASE_URL}/history`, {
    params: { page },
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};