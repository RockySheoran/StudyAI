// frontend/src/lib/Store/Quiz-Qna/quizQnaHistoryStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
import { useQuizStore } from './quizStore';
import { useQnAStore } from './qnaStore';
import { Quiz_history_get } from '@/Actions/Get-History/Get_Quiz_history';
import { Qna_history_get } from '@/Actions/Get-History/Get_Qna_history';

export interface QuizResult {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  difficulty: 'easy' | 'medium' | 'hard'
}

interface IQuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  results: QuizResult[];
}


export interface QuizHistoryItem {
  id: string;
  type: 'quiz';
  educationLevel: string;
 topic:string;
  timestamp: Date;
  result?: IQuizResult; // Full quiz result for detailed view
}
export interface IQnAResult {
  question: string;
  answer: string;
  score: number;
  maxMarks: number;
  feedback: string;
}
interface IQnAAllResult {
  totalScore: number;
  maxPossibleScore: number;
  evaluations: IQnAResult[];
}
export interface QnAHistoryItem {
  id: string;
  type: 'qna';
  educationLevel: string;
  topic: string;
  timestamp: Date;
  result?: IQnAAllResult ; // Full QnA result for detailed view
}

export type HistoryItem = QuizHistoryItem | QnAHistoryItem;

interface QuizQnAHistoryState {
  // Combined history
  allHistory: HistoryItem[];
  selectedHistoryItem: HistoryItem | null;
  currentView: 'history' | 'results';
  activeTab: 'quiz' | 'qna';
  
  // Actions
  setActiveTab: (tab: 'quiz' | 'qna') => void;
  setSelectedHistoryItem: (item: HistoryItem | null) => void;
  setCurrentView: (view: 'history' | 'results') => void;
  getLatestHistory: (count?: number) => HistoryItem[];
  getQuizHistory: (count?: number) => QuizHistoryItem[];
  getQnAHistory: (count?: number) => QnAHistoryItem[];
  refreshHistory: (params: {token: string}) => Promise<void>;
  clearAllHistory: () => void;
}

export const useQuizQnAHistoryStore = create<QuizQnAHistoryState>()(
  devtools(
    persist(
      (set, get) => ({
        allHistory: [],
        selectedHistoryItem: null,
        currentView: 'history',
        activeTab: 'quiz',

        setActiveTab: (tab) => {
          set({ activeTab: tab });
        },

        setSelectedHistoryItem: (item) => {
          set({ 
            selectedHistoryItem: item,
            currentView: item ? 'results' : 'history'
          });
        },

        setCurrentView: (view) => {
          set({ currentView: view });
          if (view === 'history') {
            set({ selectedHistoryItem: null });
          }
        },

        getLatestHistory: (count = 3) => {
          const { allHistory } = get();
          return allHistory
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, count);
        },

        getQuizHistory: (count = 3) => {
          const { allHistory } = get();
          return allHistory
            .filter((item): item is QuizHistoryItem => item.type === 'quiz')
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, count);
        },

        getQnAHistory: (count = 3) => {
          const { allHistory } = get();
          return allHistory
            .filter((item): item is QnAHistoryItem => item.type === 'qna')
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, count);
        },

        refreshHistory: async ({token }: {token: string}) => {
          if(!token){
            return;
          }

           if(get().allHistory?.length > 0){
            return;
           }
          
            // Fetch data from APIs
            const [quizResponse, qnaResponse] = await Promise.all([
              Quiz_history_get({ token }),
              Qna_history_get({ token })
            ]);
            console.log(quizResponse)
            console.log(qnaResponse)

            const combinedHistory: HistoryItem[] = [];

            // Process Quiz history
            if (quizResponse.status === 200 && quizResponse.data) {
              const quizItems: QuizHistoryItem[] = quizResponse?.data.data?.map((item: any): QuizHistoryItem => ({
                id: item._id || item.id,
                type: 'quiz',
                topic:item.topic,
                educationLevel: item.educationLevel,
                timestamp: new Date(item.createdAt ),
                result: item.result
              }));
              combinedHistory.push(...quizItems);
            }

            // Process QnA history
            if (qnaResponse.status === 200 && qnaResponse.data) {
              const qnaItems: QnAHistoryItem[] = qnaResponse?.data?.data?.map((item: any): QnAHistoryItem => ({
                id: item._id || item.id,
                type: 'qna',
                educationLevel: item.educationLevel,
                topic: item.topic,
                timestamp: new Date(item.createdAt),
                result: item.result 
              }));
              combinedHistory.push(...qnaItems);
            }
console.log(combinedHistory)
            // Update the store with fetched data
            set({ allHistory: combinedHistory });

        

        },

        clearAllHistory: () => {
          set({ 
            allHistory: [],
            selectedHistoryItem: null,
            currentView: 'history'
          });
          // Also clear individual stores
          useQuizStore.getState().clearQuizHistory();
          useQnAStore.getState().clearQnAHistory();
        },
      }),
      {
        name: 'quiz-qna-history-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          allHistory: state.allHistory,
          activeTab: state.activeTab,
        }),
      }
    )
  )
);

// Note: Auto-refresh disabled since refreshHistory now requires token
// Components should call refreshHistory manually with token when needed
