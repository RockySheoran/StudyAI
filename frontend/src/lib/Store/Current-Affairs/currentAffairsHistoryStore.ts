// frontend/src/lib/Store/Current-Affairs/currentAffairsHistoryStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
import { fetchHistory } from '@/Actions/Current_Affairs/CurrentAffair_Api';
import { CurrentAffair } from '@/types/Current-Affairs/CurrentAffair-types';
import axios from 'axios';

export interface CurrentAffairsHistoryItem {
  id: string;
  type: 'current-affairs';
  title: string;
  summary: string;
  fullContent: string;
  category: string;
  sourceUrl?: string;
  timestamp: Date;
  readTime?: number; // Time spent reading in seconds
}

interface CurrentAffairsHistoryState {
  // History data
  allHistory: CurrentAffairsHistoryItem[];
  selectedHistoryItem: CurrentAffairsHistoryItem | null;
  currentView: 'history' | 'details';
  
  // Actions
  setSelectedHistoryItem: (item: CurrentAffairsHistoryItem | null) => void;
  setCurrentView: (view: 'history' | 'details') => void;
  getLatestHistory: (count?: number) => CurrentAffairsHistoryItem[];
  refreshHistory: (token: string,refresh?: boolean) => Promise<void>;
  addToHistory: (affair: CurrentAffair, readTime?: number) => void;
  clearAllHistory: () => void;
}

export const useCurrentAffairsHistoryStore = create<CurrentAffairsHistoryState>()(
  devtools(
    persist(
      (set, get) => ({
        allHistory: [],
        selectedHistoryItem: null,
        currentView: 'history',

        setSelectedHistoryItem: (item) => {
          set({ 
            selectedHistoryItem: item,
            currentView: item ? 'details' : 'history'
          });
        },

        setCurrentView: (view) => {
          set({ currentView: view });
          if (view === 'history') {
            set({ selectedHistoryItem: null });
          }
        },

        getLatestHistory: (count = 2) => {
          const { allHistory } = get();
          return allHistory
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, count);
        },

        refreshHistory: async (token,refresh=false) => {
          // Refreshing current affairs history
          if (!token) {
            return;
          }

          // Check if we already have data to avoid unnecessary API calls
          if (get().allHistory?.length > 0 && !refresh) {
            return;
          }
          
          try {
            // Fetch data from API
            // const response = await fetchHistory(1, token);
            const response = await axios.get(`${process.env.NEXT_PUBLIC_CURRENT_AFFAIRS_BACKEND_URL}/api/current-affairs/history`, {
              params: { page: 1 },
              headers: { Authorization: `Bearer ${token}` },
            });
            
            if (response && response.data.affairs) {
              const historyItems: CurrentAffairsHistoryItem[] = response.data.affairs.map((affair: CurrentAffair): CurrentAffairsHistoryItem => ({
                id: affair._id || `${affair.title}-${Date.now()}`,
                type: 'current-affairs',
                title: affair.title,
                summary: affair.summary,
                fullContent: affair.fullContent,
                category: affair.category,
                sourceUrl: affair.sourceUrl,
                timestamp: new Date(affair.createdAt || Date.now()),
                readTime: 0
              }));
              
              // Update the store with fetched data
              set({ allHistory: historyItems });
            }
          } catch (error:any) {
            
           
            console.error('Failed to fetch current affairs history:', error);
          }
        },

        addToHistory: (affair: CurrentAffair, readTime = 0) => {
          const { allHistory } = get();
          
          // Check if item already exists
          const existingIndex = allHistory.findIndex(item => 
            item.id === affair._id || item.title === affair.title
          );
          
          const historyItem: CurrentAffairsHistoryItem = {
            id: affair._id || `${affair.title}-${Date.now()}`,
            type: 'current-affairs',
            title: affair.title,
            summary: affair.summary,
            fullContent: affair.fullContent,
            category: affair.category,
            sourceUrl: affair.sourceUrl,
            timestamp: new Date(),
            readTime
          };
          
          if (existingIndex >= 0) {
            // Update existing item
            const updatedHistory = [...allHistory];
            updatedHistory[existingIndex] = {
              ...updatedHistory[existingIndex],
              timestamp: new Date(),
              readTime: (updatedHistory[existingIndex].readTime || 0) + readTime
            };
            set({ allHistory: updatedHistory });
          } else {
            // Add new item
            set({ allHistory: [historyItem, ...allHistory] });
          }
        },

        clearAllHistory: () => {
          set({ 
            allHistory: [],
            selectedHistoryItem: null,
            currentView: 'history'
          });
        },
      }),
      {
        name: 'current-affairs-history-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          allHistory: state.allHistory,
        }),
      }
    )
  )
);
