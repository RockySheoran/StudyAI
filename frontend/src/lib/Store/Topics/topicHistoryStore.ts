// frontend/src/lib/Store/Topics/topicHistoryStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
const { Get_Topic_history } = await import('@/actions/Get_History/Get_Topic_history');

export interface TopicHistoryItem {
  id: string;
  topic: string;
  definition: string;
  detailLevel: 'less' | 'more' | 'most';
  timestamp: Date;
  userId?: string;
}

interface TopicHistoryState {
  allHistory: TopicHistoryItem[];
  selectedHistoryItem: TopicHistoryItem | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addTopicHistory: (item: Omit<TopicHistoryItem, 'id' | 'timestamp'>) => void;
  setAllHistory: (history: TopicHistoryItem[]) => void;
  setSelectedHistoryItem: (item: TopicHistoryItem | null) => void;
  refreshHistory: (token:string,refresh? : boolean ) => Promise<void>;
  getLatestHistory: (limit?: number) => TopicHistoryItem[];
  clearHistory: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTopicHistoryStore = create<TopicHistoryState>()(
  devtools(
    persist(
      (set, get) => ({
        allHistory: [],
        selectedHistoryItem: null,
        isLoading: false,
        error: null,

        addTopicHistory: (item) => {
          const newItem: TopicHistoryItem = {
            ...item,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            timestamp: new Date(),
          };
          
          set((state) => ({
            allHistory: [newItem, ...state.allHistory],
          }));
        },

        setAllHistory: (history) => {
          set({ allHistory: history });
        },

        setSelectedHistoryItem: (item) => {
          set({ selectedHistoryItem: item });
        },

        refreshHistory: async ( token:string ,refresh=false) => {
          if (!token) return;
          
          set({ isLoading: true, error: null });

          if(get().allHistory?.length > 0 && !refresh){
            set({ isLoading: false });
            return;
          }
          
          try {

            const response = await Get_Topic_history({ token });
            
            if (response.status === 200 && response.data) {
              const formattedHistory = response.data.map((item: any) => ({
                ...item,
                id: item._id || item.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
                timestamp: new Date(item.timestamp),
              }));
              
              set({ 
                allHistory: formattedHistory,
                isLoading: false,
                error: null 
              });
            } else {
              throw new Error(response.error || 'Failed to fetch topic history');
            }
          } catch (error) {
            console.error('Error fetching topic history:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Failed to fetch history',
              isLoading: false 
            });
          }
        },

        getLatestHistory: (limit = 3) => {
          const { allHistory } = get();
          return allHistory
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit);
        },

        clearHistory: () => {
          set({ allHistory: [], selectedHistoryItem: null, error: null });
        },

        setLoading: (loading) => {
          set({ isLoading: loading });
        },

        setError: (error) => {
          set({ error });
        },
      }),
      {
        name: 'topic-history-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          allHistory: state.allHistory,
        }),
      }
    ),
    { name: 'TopicHistoryStore' }
  )
);
