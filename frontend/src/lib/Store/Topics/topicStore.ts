import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface TopicRequest {
  topic: string;
  detailLevel: 'less' | 'more' | 'most';
  userId?: string;
}

interface TopicResponse {
  topic: string;
  definition: string;
  detailLevel: string;
  timestamp: string;
}

interface TopicState {
  // Current request
  currentTopic: string;
  currentDetailLevel: 'less' | 'more' | 'most';
  
  // Response data
  response: TopicResponse | null;
  
  // Loading and error states
  loading: boolean;
  error: string;
  submitted: boolean;
  
  // History of all requests
  history: TopicResponse[];
  
  // Actions
  setCurrentTopic: (topic: string) => void;
  setCurrentDetailLevel: (detailLevel: 'less' | 'more' | 'most') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  setResponse: (response: TopicResponse | null) => void;
  setSubmitted: (submitted: boolean) => void;
  addToHistory: (response: TopicResponse) => void;
  clearHistory: () => void;
  removeFromHistory: (timestamp: string) => void;
  reset: () => void;
}

const initialState = {
  currentTopic: '',
  currentDetailLevel: 'more' as const,
  response: null,
  loading: false,
  error: '',
  submitted: false,
  history: [],
};

export const useTopicStore = create<TopicState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setCurrentTopic: (topic: string) => set({ currentTopic: topic }),
      
      setCurrentDetailLevel: (detailLevel: 'less' | 'more' | 'most') => 
        set({ currentDetailLevel: detailLevel }),
      
      setLoading: (loading: boolean) => set({ loading }),
      
      setError: (error: string) => set({ error }),
      
      setResponse: (response: TopicResponse | null) => set({ response }),
      
      setSubmitted: (submitted: boolean) => set({ submitted }),
      
      addToHistory: (response: TopicResponse) => 
        set((state) => ({ 
          history: [response, ...state.history].slice(0, 50) // Limit to 50 items
        })),
      
      clearHistory: () => set({ history: [] }),
      
      removeFromHistory: (timestamp: string) =>
        set((state) => ({
          history: state.history.filter(item => item.timestamp !== timestamp)
        })),
      
      reset: () => set({ ...initialState }),
    }),
    {
      name: 'topic-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        history: state.history,
        currentTopic: state.currentTopic,
        currentDetailLevel: state.currentDetailLevel
      }),
    }
  )
);

// Selector hooks for easier access
export const useTopicResponse = () => useTopicStore((state) => state.response);
export const useTopicLoading = () => useTopicStore((state) => state.loading);
export const useTopicError = () => useTopicStore((state) => state.error);
export const useTopicHistory = () => useTopicStore((state) => state.history);
export const useCurrentTopic = () => useTopicStore((state) => state.currentTopic);
export const useCurrentDetailLevel = () => useTopicStore((state) => state.currentDetailLevel);
export const useSubmitted = () => useTopicStore((state) => state.submitted);