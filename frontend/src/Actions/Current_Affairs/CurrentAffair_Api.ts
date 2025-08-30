'use server';
import { useUserStore } from '@/lib/Store/userStore';
import { CurrentAffairsResponse } from '@/types/Current-Affairs/CurrentAffair-types';
import axios from 'axios';
import { headers } from 'next/headers';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_CURRENT_AFFAIRS_BACKEND_URL}/api` || 'http://localhost:5000/api';

export const fetchCurrentAffairs = async (
  type: 'random' | 'custom', 
  category?: string,
  page: number = 1,
  token ?: string
): Promise<CurrentAffairsResponse> => {
  
  try {
    console.log(token , "token from store");
    console.log(API_BASE_URL , "API_BASE_URL");
    const response = await axios.get(`${API_BASE_URL}/current-affairs`, {
      params: { type, category, page },
      headers: { Authorization: `Bearer ${token}` }
    });
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
    const response = await axios.get(`${API_BASE_URL}/current-affairs/history`, {
      params: { page },
      headers: { Authorization: `Bearer ${token}` }
    });
   
    return response.data;
  } catch (error:any) {
    return {
      status:500,
      
    }
  }
};